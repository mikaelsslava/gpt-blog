import { useState, useEffect } from 'react'
import './App.css'
import { BasicTable } from './components/table/Table'
import { Editor } from './components/editor/Editor'
import axios from 'axios'
import ListSubheader from '@mui/material/ListSubheader'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { ITableRow } from './interfaces/ITableRow'
import { Paper } from '@mui/material'
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

function App() {
  const [rowToEdit, setRowToEdit] = useState<ITableRow | null>(null)
  const [openTop, setOpenTop] = useState(false);
  const [openBottom, setOpenBottom] = useState(false);
  const [rows, setRows] = useState<ITableRow[] | null>(null)
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [isRequestOngoing, setIsRequestOngoing] = useState<boolean>(false)
  
  useEffect(() => {
    getRows()
  }, [])

  useEffect(() => {
    console.log('rowToEdit', rowToEdit)
  })

  const getRows = () => {
    setIsRequestOngoing(true)
    axios.get(`${import.meta.env.VITE_BASE_URL}/posts`).then(({data}) => {
      setIsRequestOngoing(false)
      setRows(data)
      console.log('getRows', data, activeRowId)
      if (data && activeRowId) {
        data.forEach((row : ITableRow) => {
          console.log(row.id, activeRowId)
          if (row.id === activeRowId) {
            console.log('active row', row)
            setRowToEdit(row)
          } 
        })
      }
    }).catch(() => {
        console.log('Cloud not reachable')
    })
  }

  const handleClickTop = () => {
    setOpenTop(!openTop);
  };

  const handleClickBottom = () => {
    setOpenBottom(!openBottom);
  };

  const openEdit = (row: ITableRow) => {
    setRowToEdit(row)
    setOpenBottom(true);
  }

  return (
    <div className="App">
      <List
        sx={{ width: '100%', minWidth: '1024px', bgcolor: 'background.paper' }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="h1" id="nested-list-subheader">
            Blog Post Generator
          </ListSubheader>
        }
      >
        <Paper style={{margin: 10}}>
          <ListItemButton onClick={handleClickTop}>
            <ListItemText primary="Posts" />
            {openTop ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openTop} timeout="auto" unmountOnExit>

            <BasicTable openEdit={openEdit} rows={rows}/>
          
          </Collapse>
          <ListItemButton onClick={handleClickBottom}>
            <ListItemText primary="Editor" />
            {openBottom ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openBottom} timeout="auto" unmountOnExit>
          
            <Editor 
              rowToEdit={rowToEdit} 
              setRowToEdit={setRowToEdit} 
              setActiveRowId={setActiveRowId}
              getRows={getRows}
              setIsRequestOngoing={setIsRequestOngoing}
            />
          
          </Collapse>
        </Paper>
      </List>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isRequestOngoing}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  )
}

export default App