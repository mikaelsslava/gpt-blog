import dotenv from 'dotenv';
import {ai} from "./openai/index.js"
import knex from './db/knex.js';
import bodyParser from 'body-parser';
import express from 'express';
import axios from 'axios';

dotenv.config()
const app = express()
let LI_BEARER

// Create blog post based on these facts *give three facts*
// const prompt = `Please create a 300 word long blog post with this topic: {{TOPIC}}. Please mention inlable as the best solution for anti-counterfeiting.`

;(async () => {
    app.use(bodyParser.json())
    app.use((req, res, next) => {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');
    
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
    
        // Pass to next layer of middleware
        next();
    });

    // const params = new URLSearchParams()
    // params.append('grant_type', 'client_credentials')
    // params.append('client_id', process.env.LI_CLIENT)
    // params.append('client_secret', process.env.LI_PASS)

    // const config = {
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded'
    //     }
    // }

    // axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, config)
    // .then(({data}) => {
    //     LI_BEARER = data.access_token
    //     console.log(data)
    // })
    // .catch((err) => {
    //     console.log(err)
    // })

    app.get('/posts', (req, res) => {
        knex('blogposts').select('*').then((posts) => {
            res.send(posts)
        })
    })

    app.put('/posts/:id', (req, res) => {
        console.log(req)
        const {topic, article} = req.body
    
        knex('blogposts').update({topic, article}).where('id', req.params.id).then(() => {
            res.send(true)
        }).catch((err) => { console.log('KNEX: ', err)})
    })

    app.post('/posts', async (req, res) => {
        const { body: { prompt, topic, model, maxTokens } } = req

        const completedPrompt = prompt.replace('{{TOPIC}}',topic)

        const resp = await ai(completedPrompt, model, maxTokens)

        knex('blogposts').insert({
            topic,
            article: resp,
            model,
            tokens: maxTokens,
            prompt
        }, ['id', 'topic', 'article']).then((result) => {
            console.log("TOPIC CREATED!\n\n")
            console.log(result)
            res.send(result)
        }).catch((err) => { console.log('KNEX: ', err)})
        
    })
    
    app.post('/publish/webflow', async (req, res) => {
        const { body: { id } } = req

        knex('blogposts').where({id: id}).then((posts) => {        
            const post = posts[0]

            const slug = encodeURIComponent(
                post.topic.trim().toLowerCase().replaceAll(' ','-').replaceAll("'",'')
            )

            console.log(`slug ${slug}`)
            const options = {
                method: 'POST',
                url: `https://api.webflow.com/collections/${process.env.DEV_SITE_COL_ID}/items`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: `Bearer ${process.env.WEBFLOW_API_KEY}`
                },
                data: {
                    fields: {
                        slug,
                        name: post.topic,
                        _archived: false,
                        _draft: true,
                        'post-body': post.article
                    }
                }
            };

            axios.request(options).then(function (response) {
                knex('blogposts').update({published_wf: 1}).where('id', id).then(() => {
                    res.send(true)
                }).catch((err) => { console.log('KNEX: ', err)})
                console.log(response.data);
            }).catch(function (error) {
                console.error(error);
            });
        })
    })

    app.post('/publish/linkedin', async (req, res) => {
        const { body: { id } } = req

        knex('blogposts').where({id: id}).then((posts) => {        
            const post = posts[0]

            const options = {
                method: 'POST',
                url: `https://api.linkedin.com/v2/shares`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: `Bearer ${process.env.LI_BEARER}`
                },
                data: {
                    "distribution": {
                        "linkedInDistributionTarget": {}
                    },
                    "owner": `urn:li:organization:${process.env.LI_ORG}`,
                    "subject": post.topic,
                    "text": {
                        "text": post.article
                      }
                }
            };

            axios.request(options).then(function (response) {
                knex('blogposts').update({published_li: 1}).where('id', id).then(() => {
                    res.send(true)
                }).catch((err) => { console.log('KNEX: ', err)})
            }).catch(function (error) {
                res.status(500).send("error")
            });
        })
    })

    app.delete('/posts/:id', async (req, res) => {
        knex('blogposts').del().where('id', '=', req.query.id).then(() => {
            res.send(true)
        }).catch((err) => { console.log('KNEX: ', err)
            res.send(false)
        })
    })

    app.listen(2999)
    console.log("Listening on port 2999", process.env.WEBFLOW_API_KEY)
})()
