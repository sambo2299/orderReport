import React, { Component } from 'react'

import { Button,Box, Container, OutlinedInput, InputAdornment, Backdrop, CircularProgress } from '@mui/material';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import Table from '../component/table.component';

import * as Apis from '../lib/Apis';

const allowedMimes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

class MainContainer extends Component {
  state = {
    fileSelected: false,
    loader: false,
    ordersData: [],
    count: 0,
    limit: 10,
    page: 0,
    rowsperPageOptions: [5, 10, 25],
    from: null,
    to: null,
    selectedFile: null
  }

  fetchOrders = () => {
    let url = `${Apis.APIS.GET_ORDER}?page=${this.state.page + 1}&limit=${this.state.limit}`;
    if(this.state.from) {
      url = `${url}&from=${this.state.from}`
    };
    if(this.state.to) {
      url = `${url}&to=${this.state.to}`
    };
    const request = Apis.request('GET', url);
    if (request) {
      request
        .then(resp => {
          console.log(resp.data.data);
          if (resp.data && resp.data.datas) {
            this.setState({
              ordersData: resp.data.datas,
              count: resp.data.count
            })
          }
        })
        .catch(err => {
          console.log("err", err);
        });
    }
  }

  async componentDidMount() {
    await this.fetchOrders();
  }

  handleFileSelect = (e) => {
    e.preventDefault();
    console.log(e.target.files[0]);
    const { size, type } = e.target.files[0];
    console.log(size, type);
    if (allowedMimes.indexOf(type) < 0) {
      alert('file type not supported');
      e.target.value = null;
      return;
    }
    if (size > (20 * 1024 * 1024)) {
      alert('file size exceeds the limit!!!');
      e.value = null;
      return;
    }
    this.setState({      
      selectedFile: e.target.files[0] 
    })        
  }

  handleImport = async(e) => {
    this.setState({
      loader: true
    })
    await this.uploadAndImport();
    return;
  }

  uploadAndImport = async() => {
    const formData = new FormData();
    formData.append(
      "file",
      this.state.selectedFile,
      this.state.selectedFile.name
    );
      try {
        const resp = await Apis.request('POST', Apis.APIS.GET_ORDER, formData);
        this.setState({
          loader: false,
          selectedFile: null,
          fileSelected: false
        })
        alert(resp.data.message);
        await this.fetchOrders();
        return;
      } catch(err) {
        const { response } = err;
      const msg = response.data.message ? response.data.message: 'file not uploaded\n import unsuccessfull';
      alert(msg);
        this.setState({
          loader: false,
          selectedFile: null,
          fileSelected: false
        })
        return;
      }
    
  

  }

  handleChangeRowsPerPage = async (e, newRow) => {
    e.preventDefault();
    console.log(e.target.value)
    await this.setState({
      limit: e.target.value
    })
    this.fetchOrders();
  }

  handleChangePage = async (e, newPage) => {
    e.preventDefault();
    await this.setState({
      page: newPage
    })
    this.fetchOrders();
  }

  handleFromDateChange = async (e) => {
    this.setState({
      from: e
    });   
     
  }
  handleToDateChange = async (e) => {
    this.setState({
      to: e
    });   
  }

  downloadHandler = async() => {
    let url = `${Apis.APIS.GET_ORDER}?download=true`;
    if(this.state.from) {
      url = `${url}&from=${this.state.from}`
    };
    if(this.state.to) {
      url = `${url}&to=${this.state.to}`
    };
    const request = Apis.request('GET', url, { responseType: "blob"});
    if (request) {
      request
        .then(response => {
            const fileName = `order-report.xlsx`;        
            var bl = new Blob([response.data], { type: allowedMimes[0] });
            var a = document.createElement("a");
            a.href = URL.createObjectURL(bl);
            a.download = fileName;
            a.hidden = true;
            document.body.appendChild(a);
            a.click();                   
        })
        .catch(err => {
          console.log("err", err);
          const { response } = err;
      const msg = response.data.message ? response.data.message: 'file not downloaded';
      alert(msg);
        });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Container maxWidth="lg">
          <h2>order report</h2>
          <Box
            component="span"
            sx={{
              display: 'block',
              p: 1,
              m: 1,
              bgcolor: 'background.paper',
            }}
          >
            <OutlinedInput
              id="outlined-adornment-amount"
              type="file"
              startAdornment={<InputAdornment position="start">import from excel</InputAdornment>}
              label="xlsx"
              onChange={this.handleFileSelect}
            />
            <Button variant="outlined" size="large" style={{padding:2,margin:2}} onClick={this.handleImport}>upload and import</Button>
          </Box>
          <Box
            component="span"
            sx={{
              display: 'block',
              p: 1,
              m: 1,
              bgcolor: 'background.paper',
            }}
          >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="FROM"
              value={this.state.from}
              onChange={this.handleFromDateChange}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="TO"
              value={this.state.to}
              onChange={this.handleToDateChange}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          
          <Button variant="outlined" size="large" style={{padding:2,margin:2}} onClick={this.fetchOrders}>Reload</Button>
           <Button variant="outlined" size="large" style={{padding:2,margin:2}} onClick={this.downloadHandler}>Download Order</Button>   
          </Box>

          <Table
            datas={this.state.ordersData}
            count={this.state.count}
            limit={this.state.limit}
            page={this.state.page}
            rowsperPageOptions={this.props.rowsperPageOptions}
            handleChangeRowsPerPage={this.handleChangeRowsPerPage}
            handleChangePage={this.handleChangePage}
          />

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={this.state.loader}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </Container>
      </React.Fragment>
    )

  }
}

export default MainContainer;