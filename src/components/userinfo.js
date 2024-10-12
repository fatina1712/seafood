import * as React from "react";
import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import "@fontsource/ibm-plex-sans-thai";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Box, Grid, TextField, Typography } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const Userinfo = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [orders, setOrders] = useState([]); // เก็บข้อมูล order
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // ดึงข้อมูล user มาโชว์
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


    // ฟังก์ชั่น logout
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

    // ฟังก์ชั่น navigate ไปยัง history
    const handleHistory = () => {
        navigate('/orderhistory');
    };

    // ฟังก์ชั่น navigate ไป /userinfo
    const handleUserinfo = () => {
        navigate('/userinfo');
    };

    // ฟังก์ชั่น navigate ไป /home
    const handleHome = () => {
        navigate('/home');
    };

    const [openModal, setOpenModal] = useState(false); // State to control modal open/close

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    // Update user info
    const handleUpdate = async () => {
        try {
            const response = await axios.put('http://localhost:3000/api/update-user', userInfo, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.status === 200) {
                console.log('User info updated successfully');
                handleCloseModal(); // Close the modal after updating
            }
        } catch (error) {
            console.error('Failed to update user info:', error.response?.data || error.message);
        }
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
                    // justifyContent: 'center',
                    // alignItems:'center'
                }}>
                <Toolbar disableGutters>
                    <img
                        src="/logo.png"
                        style={{ height: "80px", width: "80px", marginRight: 'auto', cursor: 'pointer' }}
                        onClick={handleHome}
                    />



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
                        <MenuItem onClick={handleHistory}>History</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                    {userInfo && (
                        <Typography sx={{ color: "#FFFFFF", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai" }}>
                            {userInfo.username}
                        </Typography>
                    )}
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
                {/* Box ที่แสดงข้อความ ว่า ข้อมูลผู้ใช้งาน */}
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
                        <Button
                            onClick={handleOpenModal}
                            sx={{
                                width: "29px",
                                height: "30px",
                                borderRadius: "30px",
                                border: "1px solid #FFFFFF",
                                fontSize: "12px",
                                fontWeight: "700",
                                fontFamily: "IBM Plex Sans Thai",
                                color: "#FFFFFF",
                                display:'flex',
                                position:'absolute',
                                marginLeft:'290px',
                                marginTop:'-18px'
                            }}
                            variant="contained">
                            แก้ไข
                        </Button>
                        {/* เรียกตามตัวแปรใน database */}
                        <Typography sx={{ color: "black", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai", marginRight: 'auto' }}>
                            Username : {userInfo.username}
                        </Typography>
                        <Typography sx={{ color: "black", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai", marginRight: 'auto' }}>
                            Email : {userInfo.email}
                        </Typography>
                        <Typography sx={{ color: "black", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai", marginRight: 'auto' }}>
                            Name : {userInfo.cname}
                        </Typography>
                        <Typography sx={{ color: "black", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai", marginRight: 'auto' }}>
                            Lastname : {userInfo.clastname}
                        </Typography>
                        <Typography sx={{ color: "black", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai", marginRight: 'auto' }}>
                            Phone : {userInfo.phone}
                        </Typography>
                        <Typography sx={{ color: "black", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai", marginRight: 'auto' }}>
                            Address : {userInfo.address}
                        </Typography>

                    </Box>
                )}
            </Box>

            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>แก้ไขข้อมูลผู้ใช้งาน</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Username"
                        value={userInfo?.username || ''}
                        onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Email"
                        value={userInfo?.email || ''}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Name"
                        value={userInfo?.cname || ''}
                        onChange={(e) => setUserInfo({ ...userInfo, cname: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Lastname"
                        value={userInfo?.clastname || ''}
                        onChange={(e) => setUserInfo({ ...userInfo, clastname: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Phone"
                        value={userInfo?.phone || ''}
                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Address"
                        value={userInfo?.address || ''}
                        onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>ยกเลิก</Button>
                    <Button onClick={handleUpdate} variant="contained">
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Userinfo;
