import { Configuration, OpenAIApi } from "openai";

export const ai = async (prompt, model, maxTokens) => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const {data} = await openai.createCompletion({
        model: model,
        prompt,
        max_tokens: parseInt(maxTokens),
        temperature: 0,
    });

    console.log('Response:', data.choices[0].text)
    return data.choices[0].text
}