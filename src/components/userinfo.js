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
import { Box, Grid, TextField, Typography } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const Userinfo = () => {
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

    // ดึงข้อมูลมาจาก api/data เพื่อนำข้อมูลเมนูมาโชว์
    useEffect(() => {
        axios.get('http://localhost:3000/api/data')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the data!", error);
            });
    }, []);

    // ดึงข้อมูล user มาโชว์
    useEffect(() => {
        const fetchData = async () => {
            try {
                // เมื่อแต่ละ user login ทางระบบจะสุ่ม token เพื่อ login ให้ และบันทึกไปยัง database
                // ตอนที่ดึงข้อมูลของ user มาโชว์ ก็ดึงมาจาก token เพราะเมื่อล็อกอินแล้ว browser ของเราจะติด token นั้นไว้สักพัก
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

    // logout
    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await axios.post('http://localhost:3000/api/logout', { refreshToken });
            // เมื่อ logout ก็จะ remove token ที่มีอยู่ออกไปทั้งใน browser และ database
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            // เมื่อกด logout จะพาไปหน้า login
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout:', error.response?.data || error.message);
        }
    };

    // ย้ายไปหน้า /home
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
                        <MenuItem onClick={handleClose}>Profile</MenuItem>
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
                        ข้อมูลผู้ใช้งาน
                    </Typography>

                </Box>

                {/* เรียกข้อมูล userInfo มาแสดง */}
                {userInfo && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: '24px',
                            width: '40%',
                            flexDirection: 'column',
                            border: '3px solid #ECCA74',
                            borderRadius: '30px',
                            padding: '24px 0px'
                        }}>
                        {/* เรียกตามตัวแปรใน database */}
                        <Typography sx={{ color: "black", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai", marginRight: 'auto' }}>
                            Username : {userInfo.username}
                        </Typography>
                        <Typography sx={{ color: "black", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai", marginRight: 'auto' }}>
                            Email : {userInfo.email}
                        </Typography>

                    </Box>
                )}
            </Box>
        </>
    );
};

export default Userinfo;
