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
import HomeIcon from "@mui/icons-material/Home";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import HelpIcon from "@mui/icons-material/Help";
import PhoneIcon from "@mui/icons-material/Phone";
import ArticleIcon from "@mui/icons-material/Article";
import { Grid, styled } from "@mui/material";
import axios from "axios";
import Switch from "@mui/material/Switch";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: '61px',
  height: '34px',
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 24,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(27px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 5,
    '&.Mui-checked': {
      transform: 'translateX(27px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 24,
    height: 24,
    borderRadius: 12,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 17,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
  },
}));

function EditProduct() {

  // ดึงข้อมูลจากฐานข้อมูลมาใส่ในตัวแปรนี้ แล้วเอาไปแสดง
  const [products, setProducts] = React.useState([]);

  // ฟังก์ชั่น เปิด - ปิด Modal แก้ไข
  const [open, setOpen] = React.useState(false);

  // เอาข้อมูลเดิมจากฐานข้อมูล มาใส่ในตัวแปรนี้ แล้วเอาไปโชว์ตอนกด แก้ไข
  const [currentProduct, setCurrentProduct] = React.useState({});

  const [openAdd, setOpenAdd] = React.useState(false);

  // ฟังก์ชั่น เปิด - ปิด Modal ของการเพิ่มสินค้า
  const handleAddOpen = () => setOpenAdd(true);
  const handleAddClose = () => setOpenAdd(false);

  // บันทึกข้อมูลใหม่ลงในตัวแปรนี้ แล้วบันทึกไปใน ฐานข้อมูล
  const [newProduct, setNewProduct] = React.useState({
    menu: '',
    price_per_kg: '',
    productimage: ''
  });


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
    axios.post('http://localhost:3000/api/data', newProduct)
      .then(response => {
        console.log(response.data);
        setProducts([...products, newProduct]);
        handleAddClose();
      })
      .catch(error => {
        console.error("There was an error adding the product!", error);
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
    axios.put(`http://localhost:3000/api/data/${currentProduct.pid}`, currentProduct)
      .then(response => {
        console.log(response.data);
        setProducts(products.map(product =>
          product.pid === currentProduct.pid ? currentProduct : product
        ));
        handleClose();
      })
      .catch(error => {
        console.error("There was an error updating the product!", error);
      });
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#938667", paddingLeft: '24px', paddingRight: '24px' }}>
        <Toolbar disableGutters>
          <img src="/logo.png" style={{ height: "80px", width: "80px" }} />

          <Button
            sx={{
              color: "#FFFFFF",
              marginLeft: "230px",
              fontSize: "20px",
              fontWeight: "700",
              fontFamily: "IBM Plex Sans Thai",
            }}
          >
            <HomeIcon sx={{ marginRight: "8px", fontSize: "32px" }} />
            หน้าแรก
          </Button>

          <Button
            sx={{
              color: "#FFFFFF",
              marginLeft: "24px",
              fontSize: "20px",
              fontWeight: "700",
              fontFamily: "IBM Plex Sans Thai",
            }}
          >
            <ShoppingBasketIcon
              sx={{ marginRight: "8px", fontSize: "32px" }}
            />
            สินค้า
          </Button>

          <Button
            sx={{
              color: "#FFFFFF",
              marginLeft: "24px",
              fontSize: "20px",
              fontWeight: "700",
              fontFamily: "IBM Plex Sans Thai",
            }}
          >
            <HelpIcon sx={{ marginRight: "8px", fontSize: "32px" }} />
            คำถามที่พบบ่อย
          </Button>

          <Button
            sx={{
              color: "#FFFFFF",
              marginLeft: "24px",
              fontSize: "20px",
              fontWeight: "700",
              fontFamily: "IBM Plex Sans Thai",
            }}
          >
            <PhoneIcon sx={{ marginRight: "8px", fontSize: "32px" }} />
            ติดต่อเรา
          </Button>

          <Button
            sx={{
              color: "#FFFFFF",
              marginLeft: "24px",
              fontSize: "20px",
              fontWeight: "700",
              fontFamily: "IBM Plex Sans Thai",
            }}
          >
            <ArticleIcon sx={{ marginRight: "8px", fontSize: "32px" }} />
            เงื่อนใขการให้บริการ
          </Button>

          <IconButton sx={{ marginLeft: 'auto' }}>
            <Avatar />
          </IconButton>
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
        <Box sx={{ display: 'flex', alignItems: 'center', mt: '24px', width: '80%', flexDirection: 'column' }}>
          <Grid container sx={{ mx: 'auto' }}>
            {products.map((product) => (

              <Grid item xs={12} md={6} l={6} xl={4} key={product.pid}>

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
                    <Typography sx={{ marginLeft: 'auto', marginRight: '12px', fontSize: '16px', fontWeight: '700', fontFamily: 'IBM Plex Sans Thai' }} >
                      ปิดเมื่อรายการสินค้าหมด
                    </Typography>
                    <AntSwitch
                      defaultChecked
                      inputProps={{ 'aria-label': 'ant design' }}
                      sx={{
                        marginRight: 'auto'
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      width: "300px",
                      height: "200px",
                    }}
                  >

                    <img
                      src={product.productimage}
                      alt={product.menu}
                      style={{ width: '100%', height: '100%', borderRadius: '10px' }}
                    />

                  </Box>

                  <Typography
                    sx={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#938667',
                      fontFamily: 'IBM Plex Sans Thai',
                      marginTop: '8px'
                    }}
                  >
                    {product.menu}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '24px',
                      fontWeight: '400',
                      color: '#EAAF18',
                      fontFamily: 'IBM Plex Sans Thai',
                      marginTop: '8px'
                    }}
                  >
                    {product.price_per_kg} บาท / กิโลกรัม
                  </Typography>

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

                    {/* ปุ่มลบ */}
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
                      onClick={() => handleDelete(product.pid)}
                    >
                      ลบ
                    </Button>


                    {/* ปุ่มแก้ไข */}
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
                      onClick={() => handleEdit(product)}
                    >
                      แก้ไข
                    </Button>

                  </Box>

                </Box>
              </Grid>
            ))}
          </Grid>

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
          {/* <TextField
            margin="normal"
            fullWidth
            label="รหัสสินค้า"
            name="pid"
            value={newProduct.pid}
            onChange={handleAddChange}
            variant="outlined"
            sx={{ mt: 2 }}
          /> */}
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
          <TextField
            margin="normal"
            fullWidth
            label="URL รูปสินค้า"
            name="productimage"
            value={newProduct.productimage}
            onChange={handleAddChange}
            variant="outlined"
            sx={{ mt: 2 }}
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
          <TextField
            margin="normal"
            fullWidth
            label="URL รูปสินค้า"
            name="productimage"
            value={currentProduct.productimage || ""}
            onChange={handleChange}
            variant="outlined"
            sx={{ mt: 2 }}
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
