import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { ITableRow } from '../../interfaces/ITableRow';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import axios from 'axios';

interface IEditor {
    rowToEdit: ITableRow | null,
    setRowToEdit: (row: ITableRow | null) => any,
    getRows: () => any,
    setIsRequestOngoing: (b: boolean) => any,
    setActiveRowId: (id: number) => any,
}

export const Editor = ({ rowToEdit, setRowToEdit, getRows, setIsRequestOngoing, setActiveRowId }: IEditor) => {
    const [prompt, setPrompt] = useState(`Please create a 300 word long blog post with this topic: {{TOPIC}}. Please mention inlable as the best solution for anti-counterfeiting.`);
    const [topic, setTopic] = useState('');
    const [article, setArticle] = useState('');
    const [model, setModel] = useState(rowToEdit && rowToEdit.model ? rowToEdit.model : 'text-davinci-003');
    const [maxTokens, setMaxTokens] = useState(rowToEdit && rowToEdit.maxTokens ? rowToEdit.maxTokens : 350);

  const handleMaxTokenChange = (event: Event, newValue: number | number[]) => {
    setMaxTokens(newValue as number);
  };

    const handleChange = (event: SelectChangeEvent) => {
        setModel(event.target.value as string);
      };
    
    useEffect(() => {
        console.log('rowToEdit', rowToEdit)
        if (rowToEdit) {
            setTopic(rowToEdit?.topic)
            setArticle(rowToEdit?.article)
        }
    }, [rowToEdit])

    const clear = () => {
        setPrompt('')
        setTopic('')
        setArticle('')
        setActiveRowId(0)
        setRowToEdit(null)
    }

    const publish = (platform: string) => {
        rowToEdit && console.log(rowToEdit.id)
        rowToEdit && setActiveRowId(rowToEdit.id)
        setIsRequestOngoing(true)
        axios.post(`${import.meta.env.VITE_BASE_URL}/publish/${platform}`, { id: rowToEdit?.id }).then((response) => {
            getRows()
            console.log(response)
        }).catch((err) => {
            alert(`error: ${err}`)
            getRows()
            console.log(err)
        })
    }

    const save = () => {
        setIsRequestOngoing(true)
        axios.put(`${import.meta.env.VITE_BASE_URL}/posts/${rowToEdit?.id}`, {
            topic,
            article
        }).finally(() => {
            setIsRequestOngoing(false)
        })
    }
   
    const create = () => {
        setIsRequestOngoing(true)
        axios.post(`${import.meta.env.VITE_BASE_URL}/posts`, {
            prompt,
            topic,
            model,
            maxTokens
        }).then(({data}) => {
            setIsRequestOngoing(false)
            console.log(data)
            setRowToEdit(data[0])
        })
    }

    return (
        <div>
            <div style={{display: 'flex', margin: '15px', flexDirection: 'column'}}>
                <TextField
                    id="prompt"
                    label="Prompt"
                    multiline
                    variant="filled"
                    value={!!rowToEdit?.id ? '' : prompt}
                    disabled={!!rowToEdit?.id}
                    onChange={(e) => {
                        setPrompt(e.target.value);
                    }}
                />
                <br/>
                <TextField
                    id="topic"
                    label="Topic"
                    variant="filled"
                    multiline
                    value={topic}
                    onChange={(e) => {
                        setTopic(e.target.value);
                    }}
                />
                <br/>
                <div>
                    <Box sx={{ width: 'calc(100% - 18px)' }}>
                        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                            <Select
                                labelId="model"
                                id="model"
                                value={model}
                                label="Model"
                                onChange={handleChange}
                                disabled={!!rowToEdit?.id}
                                sx={{width: 180}}
                            >
                                <MenuItem value={'text-davinci-003'}>text-davinci-003</MenuItem>
                                <MenuItem value={'text-ada-001'}>text-ada-001</MenuItem>
                                <MenuItem value={'text-curie-001'}>text-curie-001</MenuItem>
                                <MenuItem value={'text-babbage-001'}>text-babbage-001</MenuItem>
                            </Select>
                            <Typography variant="body2" component="p">
                                Max Tokens: {maxTokens}
                            </Typography>
                            <Slider 
                                disabled={!!rowToEdit?.id}
                                aria-label="Max Tokens"
                                value={maxTokens}
                                onChange={handleMaxTokenChange}
                                step={10}
                                marks
                                min={100}
                                max={1000}
                            />
                        </Stack>
                    </Box>
                </div>
                <TextField
                    id="article"
                    label="Article"
                    multiline
                    maxRows={22}
                    minRows={22}
                    variant="filled"
                    value={article}
                    onChange={(e) => {
                        setArticle(e.target.value);
                    }}
                />
            </div>
            <div style={{display: 'flex', margin: '15px'}}>
                {rowToEdit && <>
                    <Button
                        variant="outlined"
                        onClick={() => {publish('webflow')}}
                        disabled={!!rowToEdit.published_wf}
                        style={{
                            margin: '10px',
                            minWidth: '80px',
                            maxWidth: '80px'
                        }}
                    >
                        Webflow
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => {publish('linkedin')}}
                        disabled={!!rowToEdit.published_li}
                        style={{
                            margin: '10px',
                            minWidth: '80px',
                            maxWidth: '80px'
                        }}
                    >
                        LinkedIn
                    </Button>
                </>}
                <Button 
                    variant="outlined"
                    onClick={clear}
                    disabled={!topic || !article}
                    style={{
                        margin: '10px',
                        marginLeft: 'auto',
                        minWidth: '100px',
                        maxWidth: '100px'
                    }}
                >
                    Discard
                </Button>
                <Button 
                    variant="contained"
                    onClick={rowToEdit && rowToEdit.id ? save : create}
                    disabled={rowToEdit && rowToEdit.id ? false : (!prompt && !topic)}
                    style={{
                        margin: '10px',
                        minWidth: '100px',
                        maxWidth: '100px'
                    }}
                >
                    {rowToEdit && rowToEdit.id ? 'Save' : 'Create'}
                </Button>
            </div>
        </div>
    )
}