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


  // บันทึกข้อมูลใหม่ลงในตัวแปรนี้ แล้วบันทึกไปใน ฐานข้อมูล
  const [newProduct, setNewProduct] = React.useState({
    menu: '',
    price_per_kg: '',
    productimage: ''
  });

  // เอาไว้เปิดตัว icon avatar
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseAvatar = () => {
    setAnchorEl(null);
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

    // ตรวจสอบว่ามีการอัปโหลดรูปใหม่มั้ย
    if (currentProduct.productImage) {
      formData.append('productImage', currentProduct.productImage);
    }

    axios.put(`http://localhost:3000/api/data/${currentProduct.pid}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        console.log(response.data);
        setProducts(products.map(product =>
          product.pid === currentProduct.pid ? currentProduct : product
        ));
        // เมื่อกดอัพเดทแล้ว ดึงข้อมูล Products มาอีกครั้ง จะได้ไม่ต้อง restart หน้าเว็บใหม่ ข้อมูลจะดึงมาเลยตอนเปลี่ยน
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
                    {product.menu}
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

          {/* ตัวนี้เป็นตัวอัพโหลดไฟล์รูปของสินค้า */}
          <input
            type="file"
            name="productImage"
            // เมื่ออัพโหลดแล้วรูปที่อัพโหลดจะเข้าไปใน productImage
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
            {/* เมื่อกด บันทึก handleAddSave จะทำงาน คือการเพิ่มข้อมูล */}
            <Button variant="contained" onClick={handleAddSave}>
              บันทึก
            </Button>
            {/* เมื่อกด ยกเลิก handleAddClose จะทำงาน คือการปิด Modal เพิ่มข้อมูล */}
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
          {/* ตัวนี้เป็นตัวอัพโหลดไฟล์รูปของสินค้า */}
          <input
            type="file"
            name="productImage"
            onChange={(e) =>
              setCurrentProduct({
                ...currentProduct,
                // เมื่ออัพโหลดแล้วรูปที่อัพโหลดจะเข้าไปใน productImage
                productImage: e.target.files[0],
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

    </>
  );
}
export default EditProduct;
