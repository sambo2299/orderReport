import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';


 const table = (props) => {
   const headerItems = [];
  const fillHeader = () => {
    for(let key in props.datas[0]){
      headerItems.push(key)      
    }
  }

  fillHeader();

  return (
    <div>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 750 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {
              headerItems.map((itm, id) => <TableCell key={id}>{itm}</TableCell>)                
            }          
            
          </TableRow>
        </TableHead>
        <TableBody>
          {props.datas.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {
                headerItems.map((itm, id) => <TableCell align="right" key={id}>{row[itm]}</TableCell>)                
              }
            </TableRow>
          ))}
        </TableBody>
       

      </Table>
    </TableContainer>    
    <TablePagination
    rowsPerPageOptions={props.rowsperPageOptions}
    component="div"
    count={props.count}
    rowsPerPage={props.limit}
    page={props.page}
    onPageChange={props.handleChangePage}
    onRowsPerPageChange={props.handleChangeRowsPerPage}
  />
</div>
  );
}

export default table;