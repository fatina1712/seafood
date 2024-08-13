import * as React from "react";
import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import "@fontsource/ibm-plex-sans-thai";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import HelpIcon from "@mui/icons-material/Help";
import PhoneIcon from "@mui/icons-material/Phone";
import ArticleIcon from "@mui/icons-material/Article";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Select, TextField, Typography } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const Home = () => {
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // ดึงข้อมูลจากฐานข้อมูลมาใส่ในตัวแปรนี้ แล้วเอาไปแสดง
    const [products, setProducts] = React.useState([]);

    // จำนวนกิโล
    const [amount, setAmount] = React.useState('0.1');

    // เพิ่มกิโล
    const increase = () => {
        setAmount(prevAmount => (parseFloat(prevAmount) + 0.1).toFixed(1));
    };

    // ลดกิโล
    const decrease = () => {
        setAmount(prevAmount => {
            const newAmount = parseFloat(prevAmount) - 0.1;
            return newAmount > 0 ? newAmount.toFixed(1) : '0.1';
        });
    };

    // กำหนดตัวแปรรูปแบบการทำ
    const [cookType, setCookType] = React.useState("");
    const handleCookTypeChange = (event) => {
        setCookType(event.target.value);
    };

    useEffect(() => {
        axios.get('http://localhost:3000/api/data')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the data!", error);
            });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/protected-data', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUserInfo(response.data);
            } catch (error) {
                console.error('Failed to fetch user info:', error.response?.data || error.message);
            }
        };

        fetchData();
    }, []);

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await axios.post('http://localhost:3000/api/logout', { refreshToken });
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout:', error.response?.data || error.message);
        }
    };

    const handleUserinfo = () => {
        navigate('/userinfo');
    };

    const handleHome = () => {
        navigate('/home');
    };

    return (
        <>
            <AppBar
                position="static"
                sx={{
                    bgcolor: "#938667",
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                <Toolbar disableGutters>
                    <img src="/logo.png" style={{ height: "80px", width: "80px", marginLeft: 'auto' }} />

                    <TextField
                        id="branch"
                        placeholder='ค้นหาสินค้า'
                        variant="outlined"
                        InputLabelProps={{
                            style: { color: '#878787' }
                        }}
                        InputProps={{
                            style: {
                                border: '1px solid #878787',
                                borderRadius: '50px'
                            }
                        }}
                        sx={{
                            width: '40%',
                            borderRadius: '50px',
                            bgcolor: 'white',
                            marginLeft: 'auto'
                        }}
                    />

                    <Button
                        sx={{
                            width: '10%',
                            height: '56px',
                            borderRadius: '10px',
                            border: '3px solid #FFFFFF',
                            color: '#FFFFFF',
                            marginLeft: 'auto'
                        }}
                    >
                        <ShoppingCartIcon
                            sx={{
                                marginRight: '48px'
                            }}
                        />

                        ฿
                    </Button>

                    <IconButton
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                        sx={{
                            marginLeft: 'auto'

                        }}>
                        <Avatar />
                    </IconButton>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem onClick={handleUserinfo}>Profile</MenuItem>
                        <MenuItem onClick={handleClose}>My account</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                    {userInfo && (
                        <Typography sx={{ color: "#FFFFFF", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai", marginRight: 'auto' }}>
                            {userInfo.username}
                        </Typography>
                    )}
                </Toolbar>
            </AppBar>
            <AppBar
                position="static"
                sx={{
                    bgcolor: "#938667",
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    backgroundColor: '#EAAF18',
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                <Toolbar disableGutters>
                    <Button
                        onClick={handleHome}
                        sx={{
                            color: "#FFFFFF",
                            marginLeft: "auto",
                            fontSize: "16px",
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
                            marginLeft: "auto",
                            fontSize: "16px",
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
                            marginLeft: "auto",
                            fontSize: "16px",
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
                            marginLeft: "auto",
                            fontSize: "16px",
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
                            marginLeft: "auto",
                            fontSize: "16px",
                            fontWeight: "700",
                            fontFamily: "IBM Plex Sans Thai",
                            marginRight: 'auto'
                        }}
                    >
                        <ArticleIcon sx={{ marginRight: "8px", fontSize: "32px" }} />
                        เงื่อนใขการให้บริการ
                    </Button>
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
                        สั่งสินค้า
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
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginTop: '16px'
                                        }}
                                    >
                                        <IconButton onClick={decrease} sx={{ height: '32px', width: '32px', marginRight: '18px' }}>
                                            <RemoveCircleIcon sx={{ color: '#EAAF18', fontSize: '32px' }} />
                                        </IconButton>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '33px',
                                                width: '101px',
                                                backgroundColor: '#FFFFFF',
                                                color: 'black',
                                                border: '1px solid #EAAF18',
                                                borderRadius: '10px'
                                            }}
                                        >
                                            <Typography>
                                                {amount}
                                            </Typography>
                                        </Box>
                                        <IconButton onClick={increase} sx={{ height: '32px', width: '32px', marginLeft: '18px' }}>
                                            <AddCircleIcon sx={{ color: '#EAAF18', fontSize: '32px' }} />
                                        </IconButton>
                                    </Box>

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


                                        {/* ปุ่มแก้ไข */}
                                        <Select
                                            value={cookType}
                                            onChange={handleCookTypeChange}
                                            displayEmpty
                                            style={{
                                                height: '33px',
                                                width: '202px',
                                                border: '1px solid #EAAF18',
                                                borderRadius: '10px'
                                            }}
                                        >
                                            <MenuItem value="" disabled>
                                                เลือกรูปแบบการทำ
                                            </MenuItem>
                                            <MenuItem value={'หั่นชิ้น'}>หั่นชิ้น</MenuItem>
                                            <MenuItem value={'แกะทั้งตัว'}>แกะทั้งตัว</MenuItem>
                                            <MenuItem value={30}>Thirty</MenuItem>
                                        </Select>


                                    </Box>

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


                                        {/* ปุ่มใส่ตะกร้า */}
                                        <Button
                                            sx={{
                                                height: '44px',
                                                bgcolor: '#EAAF18',
                                                border: '1px solid #524B38',
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: '#FFFFFF',
                                                fontFamily: "IBM Plex Sans Thai",
                                                borderRadius: '10px',
                                                padding: '0px 24px'
                                            }}
                                        >
                                            ใส่ตะกร้า
                                        </Button>

                                    </Box>

                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
            <Button onClick={handleLogout}>Logout</Button>
        </>
    );
};

export default Home;
