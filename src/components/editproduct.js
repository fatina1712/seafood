import * as React from "react";
import { useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import "@fontsource/ibm-plex-sans-thai";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Grid2, styled, FormControlLabel } from "@mui/material";
import axios from "axios";
import Switch from "@mui/material/Switch";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useNavigate } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';


function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function EditProduct() {

  // ดึงข้อมูลจากฐานข้อมูลมาใส่ในตัวแปรนี้ แล้วเอาไปแสดง
  const [products, setProducts] = React.useState([]);

  // ฟังก์ชั่น เปิด - ปิด Modal แก้ไข
  const [open, setOpen] = React.useState(false);

  // เอาข้อมูลเดิมจากฐานข้อมูล มาใส่ในตัวแปรนี้ แล้วเอาไปโชว์ตอนกด แก้ไข
  const [currentProduct, setCurrentProduct] = React.useState({});

  // ฟังก์ชั่น เปิด - ปิด Modal ของการเพิ่มสินค้า
  const [openAdd, setOpenAdd] = React.useState(false);
  const handleAddOpen = () => setOpenAdd(true);
  const handleAddClose = () => setOpenAdd(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  // ตัวแปร value เอาไว้เซ็ตค่าของ CustomPanelTab ของ MUI เพื่อจะให้มันเปลี่ยนหน้าไปมาได้
  const [value, setValue] = React.useState(0);


  // บันทึกข้อมูลใหม่ลงในตัวแปรนี้ แล้วบันทึกไปใน ฐานข้อมูล
  const [newProduct, setNewProduct] = React.useState({
    menu: '',
    price_per_kg: '',
    productImage: '',
    type: '',
  });


  // เอาไว้เปิดตัว icon avatar
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseAvatar = () => {
    setAnchorEl(null);
  };

  // เอาไว้เปลี่ยนค่าของ value เมื่อกด แถบแสดงสถานะของ order ทั้ง 3
  const handleTabChange = (event, newValue) => {
    // โดยจะเซ็ท value ให้ = แถบที่เราคลิกไป
    setValue(newValue);
  };

  // เมื่อกดเพิ่มข้อมูล จะบันทึกข้อมูลลง ตามคำสั่งที่เขียนไว้ใน server.js ตามลำดับ
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // เมื่อกด เพิ่มข้อมูล จะทำตามคำสั่ง axios.post คือการบันทึกข้อมูลลงฐานข้อมูลตามคำสั่งที่เขียนไว้ในหน้า server.js
  const handleAddSave = () => {
    const formData = new FormData();
    formData.append('menu', newProduct.menu);
    formData.append('price_per_kg', newProduct.price_per_kg);
    formData.append('productImage', newProduct.productImage); // Add image file
    formData.append('type', newProduct.type); // เพิ่ม type

    axios.post('http://localhost:3000/api/data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        console.log(response.data);
        setProducts([...products, response.data.product]);
        handleAddClose();
      })
      .catch(error => {
        console.error('There was an error adding the product!', error);
      });
  };



  // ดึงข้อมูลมาแสดงตลอด เมื่อมีการเปลี่ยนแปลงของหน้าเว็บ
  useEffect(() => {
    axios.get('http://localhost:3000/api/data')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
      });
  }, []);

  // ลบข้อมูล ตามคำสั่งหน้า server.js โดยอิงจาก pid ถ้าปุ่มลบอยู่ใน ข้อมูล pid ตัวไหนก็จะลบข้อมูลของ pid นั้น
  const handleDelete = (id) => {
    axios.delete(`http://localhost:3000/api/data/${id}`)
      .then(response => {
        console.log(response.data);
        setProducts(products.filter(product => product.pid !== id));
      })
      .catch(error => {
        console.error("There was an error deleting the product!", error);
      });
  };

  // ฟังก์ชั่นปิด Modal เพิ่มข้อมูลตรง ยกเลิก
  const handleClose = () => {
    setOpen(false);
  };

  // ฟังก์ชั่น เปิด Modal แก้ไข และ ดึงข้อมูลเดิมจาก product มาโชว์ใน Modal
  const handleEdit = (product) => {
    setCurrentProduct(product);
    setOpen(true);
  };

  // บันทึกข้อมูลที่พิมพ์ใหม่ในแก้ไข
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // เมื่อกดปุ่มบันทึก ใน Modal แก้ไข ข้อมูลจะ update ลงไปใน ตาราง product โดยจะอัพเดทตาม pid จากข้อมูลที่กดแก้ไขมา
  const handleSave = () => {
    const formData = new FormData();
    formData.append('menu', currentProduct.menu);
    formData.append('price_per_kg', currentProduct.price_per_kg);
    formData.append('type', currentProduct.type);

    // ตรวจสอบว่ามีการอัปโหลดรูปใหม่หรือไม่
    if (currentProduct.productImage instanceof File) {
      formData.append('productImage', currentProduct.productImage); // ถ้าเป็นไฟล์ใหม่
    } else if (typeof currentProduct.productImage === 'string') {
      formData.append('existingImage', currentProduct.productImage); // ถ้าเป็น URL ของรูปเดิม
    }

    axios.put(`http://localhost:3000/api/data/${currentProduct.pid}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        console.log(response.data);
        setProducts(products.map(product =>
          product.pid === currentProduct.pid ? { ...product, ...currentProduct } : product
        ));
        fetchProducts();
        handleClose();
      })
      .catch(error => {
        console.error("There was an error updating the product!", error);
      });
  };






  // ฟังก์ชั่นดึงข้อมูลของ Products มาแสดง
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/data');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // useEffect เรียกใช้ fetchProducts เพราะ จะได้ดึงข้อมูล products มาแสดงตั้งแต่เว็บเปิดมา
  useEffect(() => {
    fetchProducts();
  }, []);

  const [status, setStatus] = React.useState(false);  // false = 0, true = 1

  // ฟังก์ชั่น เปลี่ยน status เมื่อคลิกจะเปลี่ยน status ใส่ลงในตัวแปร newStatus แล้ว เอา newStatus ไปใส่ใน setStatus อีกที
  const handleStatusChange = (e, pid) => {
    const newStatus = e.target.checked; // true if switch is on, false if off
    setStatus(newStatus);

    // ส่งคำสั่งไปยัง API เพื่ออัพเดท status
    axios.put(`http://localhost:3000/api/product/${pid}/status`, { status: newStatus })
      .then(() => {
        fetchProducts(); // รีเฟรชข้อมูล
      })
      .catch((error) => {
        console.error('Error updating product status:', error);
      });
  };

  // ฟังก์ชั่น navigate ไปยังหน้า admin 
  const handleHistoryAdmin = () => {
    navigate('/admin');
  }

  // ข้างล่างนี้ที่มีคำว่า Service เป็นการเพิ่ม ลบ แก้ไขของ service ทั้งหมด
  const [services, setServices] = React.useState([]);
  const [newService, setNewService] = React.useState({ service_name: '', type: '' });
  const [openAddService, setOpenAddService] = React.useState(false);
  const [openEditService, setOpenEditService] = React.useState(false);
  const [editService, setEditService] = React.useState({ id: '', service_name: '', type: '' });

  // ดึงข้อมูลของ service มาแสดง
  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/service');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // useEffect คือกาทำทุกครั้งเมื่อมีอะไรเปลี่ยนแปลง อันนี้คือเมื่อเปิดเว็บให้ ใช้งานฟังก์ชั่น fetchServices คือการดึงข้อมูล
  useEffect(() => {
    fetchServices();
  }, []);

  // เพิ่มข้อมูล service
  const handleAddService = () => {
    axios.post('http://localhost:3000/api/service', newService)
      .then(() => {
        fetchServices(); // ดึงข้อมูล Service ใหม่
        handleCloseAddService();
      })
      .catch(error => {
        console.error('Error adding service:', error);
      });
  };

  // ลบข้อมูล Service
  const handleDeleteService = (id) => {
    axios.delete(`http://localhost:3000/api/service/${id}`)
      .then(() => {
        fetchServices(); // ดึงข้อมูล Service ใหม่
      })
      .catch(error => {
        console.error('Error deleting service:', error);
      });
  };

  // แก้ไขข้อมูล service
  const handleEditService = (id, updatedService) => {
    axios.put(`http://localhost:3000/api/service/${id}`, updatedService)
      .then(() => {
        fetchServices(); // ดึงข้อมูล Service ใหม่
      })
      .catch(error => {
        console.error('Error updating service:', error);
      });
  };

  //
  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setNewService({ ...newService, [name]: value });
  };


  const handleCloseAddService = () => {
    setOpenAddService(false);
  };

  const handleEditServiceChange = (e) => {
    const { name, value } = e.target;
    setEditService({ ...editService, [name]: value }); // อัปเดตค่าของ service ที่แก้ไข
  };


  const handleOpenEditService = (service) => {
    setEditService(service); // กำหนดค่าเริ่มต้นจาก service ที่เลือก
    setOpenEditService(true); // เปิด modal แก้ไข
  };

  const handleCloseEditService = () => {
    setOpenEditService(false); // ปิด modal แก้ไข
  };


  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#938667", paddingLeft: '24px', paddingRight: '24px' }}>
        <Toolbar disableGutters>
          <img src="/logo.png" style={{ height: "80px", width: "80px" }} />



          {/* อวตาร์แสดงฟังก์ชั่น profile logout ใช้เป็น iconbutton เพราะถ้าใช้ icon เฉยๆจะไม่สามารถคลิกได้ */}
          <IconButton
            aria-controls={anchorEl ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? 'true' : undefined}
            // คลิกเพื่อเปิด คลิกอีกครั้งจะปิด
            onClick={handleClick}
            sx={{
              marginLeft: 'auto',
            }}
          >
            <Avatar />
          </IconButton>

          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseAvatar}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >

            {/* ฟังก์ชั่น navigate ไปยังหน้า history ของ admin */}
            <MenuItem onClick={handleHistoryAdmin}>History Admin</MenuItem>
          </Menu>

        </Toolbar>
      </AppBar>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="Edit products" />
            <Tab label="Services" />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "24px 0px",
              justifyContent: 'center'
            }}
          >

            <Box
              sx={{
                width: "293px",
                height: "70px",
                borderRadius: "30px",
                border: "1px solid #FFFFFF",
                bgcolor: "#938667",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >

              <Typography
                sx={{
                  fontSize: "32px",
                  fontWeight: "700",
                  fontFamily: "IBM Plex Sans Thai",
                  color: "#FFFFFF",
                }}
              >
                แก้ไขข้อมูลสินค้า
              </Typography>

            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: '24px', width: '70%', flexDirection: 'column' }}>
              <Grid2 container spacing={3} sx={{ mx: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* ดึงข้อมูลแบบวนลูป ถ้ามีข้อมูลใน database จะดึงมาแสดงจนกว่าจะครบ */}
                {products.map((product) => (

                  <Grid2 item key={product.pid}>

                    <Box
                      sx={{
                        width: "331px",
                        borderRadius: "30px",
                        border: "3px solid #EAAF18",
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '12px 0px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: '24px',
                      }}
                    >
                      {/* Switch and Label */}
                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: '16px',
                          marginBottom: '16px'
                        }}
                      >
                        <Typography sx={{ marginLeft: 'auto', marginRight: '12px', fontSize: '16px', fontWeight: '700', fontFamily: 'IBM Plex Sans Thai' }}>
                          ปิดเมื่อรายการสินค้าหมด
                        </Typography>

                        <FormControlLabel
                          control={
                            <Switch
                              // ตัวนี้เป็นตัว เช็คว่า ถ้า status = 1 จะเป็นติ๊กเปิดสีฟ้า ถ้า status = 0 จะเป็นติ๊กปิดสีเทา
                              checked={product.status}
                              // ฟังก์ชั่นเมื่อคลิกแล้วจะเปลี่ยน status ของตัว product
                              onChange={(e) => handleStatusChange(e, product.pid)}
                              name={`status-${product.pid}`}
                              color="primary"
                            />
                          }
                          // ข้อความข้างหลัง switch ถ้า status === 1 จะแสดง เปิด ถ้าไม่ใช่ จะแสดง ปิด
                          label={product.status === 1 ? "เปิด" : "ปิด"}
                        />

                      </Box>

                      {/* Product Image */}
                      <Box
                        sx={{
                          width: "300px",
                          height: "200px",
                        }}
                      >
                        <img
                          // ดึงข้อมูล productimage มาแสดง
                          src={product.productimage}
                          alt={product.menu}
                          style={{ width: '100%', height: '100%', borderRadius: '10px' }}
                        />
                      </Box>

                      {/* Product Menu */}
                      <Typography
                        sx={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#938667',
                          fontFamily: 'IBM Plex Sans Thai',
                          marginTop: '8px'
                        }}
                      >
                        {/* ดึงข้อมูล productmenu มาแสดง */}
                        {product.menu} ({product.type})
                      </Typography>

                      {/* Product Price */}
                      <Typography
                        sx={{
                          fontSize: '24px',
                          fontWeight: '400',
                          color: '#EAAF18',
                          fontFamily: 'IBM Plex Sans Thai',
                          marginTop: '8px'
                        }}
                      >
                        {/* ดึงข้อมูล ราคาต่อกิโล มาแสดง */}
                        {product.price_per_kg} บาท / กิโลกรัม
                      </Typography>

                      {/* Buttons */}
                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: '16px'
                        }}
                      >
                        <Button
                          variant="contained"
                          sx={{
                            width: '87px',
                            height: '44px',
                            bgcolor: '#FF0000',
                            border: '1px solid #524B38',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#FFFFFF',
                            fontFamily: "IBM Plex Sans Thai",
                            borderRadius: '10px'
                          }}
                          // เมื่อคลิกจะลบข้อมูลของ pid นั้นๆ ใน Box สินค้าที่เราคลิก
                          onClick={() => handleDelete(product.pid)}
                        >
                          ลบ
                        </Button>

                        <Button
                          sx={{
                            width: '87px',
                            height: '44px',
                            bgcolor: '#EAAF18',
                            border: '1px solid #524B38',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#FFFFFF',
                            ml: '24px',
                            fontFamily: "IBM Plex Sans Thai",
                            borderRadius: '10px'
                          }}
                          // เมื่อคลิกจะแก้ไข โดยดึงข้อมูลของ product ตัวที่เราคลิกมา
                          onClick={() => handleEdit(product)}
                        >
                          แก้ไข
                        </Button>

                      </Box>

                    </Box>
                  </Grid2>
                ))}
              </Grid2>

              {/* ปุ่มเพิ่มสินค้า */}
              <Button
                variant="contained"
                sx={{
                  width: "293px",
                  height: "70px",
                  borderRadius: "30px",
                  border: "1px solid #FFFFFF",
                  fontSize: "32px",
                  fontWeight: "700",
                  fontFamily: "IBM Plex Sans Thai",
                  color: "#FFFFFF",
                  marginTop: '24px'
                }}
                // เมื่อคลิกจะขึ้น Modal มาให้เพิ่มข้อมูลสินค้า
                onClick={handleAddOpen}
              >
                เพิ่มข้อมูล
              </Button>
            </Box>
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Button variant="contained" onClick={() => setOpenAddService(true)}>Add Service</Button>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.service_name}</TableCell>
                    <TableCell>{service.type}</TableCell>
                    <TableCell>
                      {/* ปุ่มแก้ไขและลบ Service  */}
                      <Button onClick={() => handleOpenEditService(service)}>Edit</Button>
                      <Button onClick={() => handleDeleteService(service.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>
      </Box>



      {/* Modal(pop up) เพิ่มข้อมูลสินค้า */}
      {/* Modal(pop up) เพิ่มข้อมูลสินค้า */}
      <Modal
        open={openAdd}
        onClose={handleAddClose}
        aria-labelledby="modal-title-add"
        aria-describedby="modal-description-add"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px",
          }}
        >
          <Typography id="modal-title-add" variant="h6" component="h2">
            เพิ่มข้อมูลสินค้า
          </Typography>

          <TextField
            margin="normal"
            fullWidth
            label="ชื่อสินค้า"
            name="menu"
            value={newProduct.menu}
            onChange={handleAddChange}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="ราคา (บาท / กิโลกรัม)"
            name="price_per_kg"
            value={newProduct.price_per_kg}
            onChange={handleAddChange}
            variant="outlined"
            sx={{ mt: 2 }}
          />

          {/* Dropdown สำหรับเลือกประเภทสินค้า */}
          <select
            name="type"
            value={newProduct.type}
            onChange={handleAddChange}
            style={{ marginTop: '16px', width: '100%', padding: '8px' }}
          >
            <option value="">เลือกประเภทสินค้า</option>
            <option value="กุ้ง">กุ้ง</option>
            <option value="หอย">หอย</option>
            <option value="ปู">ปู</option>
            <option value="ปลา">ปลา</option>
            <option value="หมึก">หมึก</option>
          </select>

          {/* ตัวนี้เป็นตัวอัพโหลดไฟล์รูปของสินค้า */}
          <input
            type="file"
            name="productImage"
            onChange={(e) => setNewProduct({ ...newProduct, productImage: e.target.files[0] })}
            accept="image/*"
            style={{ marginTop: '16px' }}
          />

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" onClick={handleAddSave}>
              บันทึก
            </Button>
            <Button variant="outlined" onClick={handleAddClose}>
              ยกเลิก
            </Button>
          </Box>
        </Box>
      </Modal>



      {/* Modal(pop up) แก้ไข */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px",
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            แก้ไขข้อมูลสินค้า
          </Typography>

          <TextField
            margin="normal"
            fullWidth
            label="ชื่อสินค้า"
            name="menu"
            value={currentProduct.menu || ""}
            onChange={handleChange}
            variant="outlined"
            sx={{ mt: 2 }}
          />

          <TextField
            margin="normal"
            fullWidth
            label="ราคา (บาท / กิโลกรัม)"
            name="price_per_kg"
            value={currentProduct.price_per_kg || ""}
            onChange={handleChange}
            variant="outlined"
            sx={{ mt: 2 }}
          />

          {/* แสดงรูปภาพปัจจุบัน ถ้ามี */}
          {currentProduct.productImage && typeof currentProduct.productImage === 'string' && (
            <img
              src={currentProduct.productImage}  // ใช้ URL ของรูปที่ดึงมาจาก database
              alt="current product"
              style={{ width: "100%", height: "auto", marginTop: "16px" }}
            />
          )}

          {/* Dropdown สำหรับเลือกประเภทสินค้า */}
          <select
            name="type"
            value={currentProduct.type || ""}
            onChange={handleChange}
            style={{ marginTop: '16px', width: '100%', padding: '8px' }}
          >
            <option value="">เลือกประเภทสินค้า</option>
            <option value="กุ้ง">กุ้ง</option>
            <option value="หอย">หอย</option>
            <option value="ปู">ปู</option>
            <option value="ปลา">ปลา</option>
            <option value="หมึก">หมึก</option>
          </select>

          {/* ตัวนี้เป็นตัวอัพโหลดไฟล์รูปของสินค้า */}
          <input
            type="file"
            name="productImage"
            onChange={(e) =>
              setCurrentProduct({
                ...currentProduct,
                productImage: e.target.files[0],  // ตั้งค่าไฟล์รูปใหม่ถ้ามีการอัปโหลด
              })
            }
            accept="image/*"
            style={{ marginTop: "16px" }}
          />

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" onClick={handleSave}>
              บันทึก
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              ยกเลิก
            </Button>
          </Box>
        </Box>
      </Modal>



      {/* Modal สำหรับเพิ่มService */}
      <Modal
        open={openAddService}
        onClose={handleCloseAddService}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            width: '500px',
            bgcolor: 'background.paper',
            padding: 2,
            borderRadius: '20px'
          }}
        >
          <TextField
            label="ชื่อ Service "
            name="service_name"
            value={newService.service_name}
            onChange={handleServiceChange}
          />
          <TextField
            label="ประเภท"
            name="type"
            value={newService.type}
            onChange={handleServiceChange}
          />
          <Button onClick={handleAddService}>บันทึก</Button>
        </Box>
      </Modal>

      {/* Modal แก้ไข Services */}
      <Modal
        open={openEditService}
        onClose={handleCloseEditService}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            width: '500px',
            bgcolor: 'background.paper',
            padding: 2,
            borderRadius: '20px',
          }}
        >
          <TextField
            label="ชื่อ Service"
            name="service_name"
            value={editService.service_name}
            onChange={handleEditServiceChange}
          />
          <TextField
            label="ประเภท"
            name="type"
            value={editService.type}
            onChange={handleEditServiceChange}
          />
          <Button onClick={() => handleEditService(editService.id, editService)}>บันทึก</Button>
        </Box>
      </Modal>


    </>
  );
}
export default EditProduct;
