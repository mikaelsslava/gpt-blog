import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { ITableRow } from '../../interfaces/ITableRow';

interface IBasicTable {
    openEdit: (row: ITableRow) => any
    rows: ITableRow[] | null
}

export const BasicTable = ({ openEdit, rows }: IBasicTable) => {

    return (
        <TableContainer style={{margin: '15px'}}>
            <Table sx={{ minWidth: 650, maxWidth: 996}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Topic</TableCell>
                        <TableCell>Model</TableCell>
                        <TableCell>Prompt</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows?.map((row) => (
                        <TableRow onClick={() => {
                            openEdit(row)
                            window.scrollTo(0,1072);
                        }}
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.id}
                            </TableCell>
                            <TableCell>
                                {row.topic}
                            </TableCell>
                            <TableCell>
                                {row.model ?? ''}
                            </TableCell>
                            <TableCell>
                                {row.prompt && `${row.prompt.substring(0, 50)}...`}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}