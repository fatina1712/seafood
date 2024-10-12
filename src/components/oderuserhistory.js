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
import { Box, TextField, Typography, Grid2, Divider } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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

function OderUserHistory() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [open, setOpen] = useState(false);
    const [value, setValue] = React.useState(0);
    const [userInfo, setUserInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [statusMap, setStatusMap] = useState({});
    const [selectedImage, setSelectedImage] = useState('');

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setOpen(true);
    };


    // ดึงข้อมูลของ user
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

    // ดึงข้อมูล order โดยดึงจาก username ของผู้ใช้เท่านั้น
    useEffect(() => {
        if (userInfo?.username) {
            const fetchOrders = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/api/orders?username=${userInfo.username}`);
                    setOrders(response.data);

                    const initialStatusMap = {};
                    response.data.forEach(order => {
                        initialStatusMap[order.BillID] = order.Status;
                    });
                    setStatusMap(initialStatusMap);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                }
            };
            fetchOrders();
        }
    }, [userInfo]);

    // รวม order ที่มี BillID เหมือนกันไว้ด้วยกัน จะได้แสดงอยู่ใน Box เดียวกันตอน ดึง ข้อมูลในแต่ละ order มาดู
    const groupOrdersByBillID = (orders) => {
        return orders.reduce((acc, order) => {
            if (!acc[order.BillID]) {
                acc[order.BillID] = [];
            }
            acc[order.BillID].push(order);
            return acc;
        }, {});
    };

    // ตัวแปรเก็บข้อมูล order ที่รวมข้อมูลที่มี BillID เหมือนกันไว้
    const groupedOrders = groupOrdersByBillID(orders);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // เอาไว้เปิด-ปิดตัว icon avatar
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // ดึงข้อมูลจากฐานข้อมูลมาใส่ในตัวแปรนี้ แล้วเอาไปแสดง
    const [products, setProducts] = React.useState([]);

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

    // ดึงข้อมูล order ตาม userInfo.username
    useEffect(() => {
        if (userInfo?.username) {  // ตรวจสอบว่ามี userInfo.username หรือไม่
            console.log(userInfo.username)
            const fetchOrders = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/api/orders?username=${userInfo.username}`);
                    setOrders(response.data);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                }
            };
            fetchOrders();
        }
    }, [userInfo]);  // ทำการดึงข้อมูลเมื่อ userInfo ถูกตั้งค่า



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

    // ฟังก์ชั่น navigate ไป /userinfo
    const handleUserinfo = () => {
        navigate('/userinfo');
    };

    // ฟังก์ชั่น navigate ไป /orderhistory
    const handleHistory = () => {
        navigate('/orderhistory');
    }


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
                    <img
                        src="/logo.png"
                        style={{ height: "80px", width: "80px", marginRight: 'auto', cursor: 'pointer' }}
                        // navigate ไปหน้า home
                        onClick={handleHome}
                    />

                    {/* อวตาร์แสดงฟังก์ชั่น profile logout ใช้เป็น iconbutton เพราะถ้าใช้ icon เฉยๆจะไม่สามารถคลิกได้ */}
                    <IconButton
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                        sx={{
                            marginLeft: 'auto'

                        }}>
                        {/* รูปอวตาร์มาแสดง */}
                        <Avatar />
                    </IconButton>

                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}  // เช็คว่า anchorEl มีค่าไหม (แสดงเมนูถ้ามีค่า)
                        onClose={() => setAnchorEl(null)}  // เมื่อเมนูปิดให้ตั้งค่า anchorEl เป็น null
                        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                    >
                        {/* ย้ายไปหน้า profile */}
                        <MenuItem onClick={handleUserinfo}>Profile</MenuItem>
                        {/* ย้ายไปหน้า history */}
                        <MenuItem onClick={handleHistory}>History</MenuItem>
                        {/* ล็อกเอาท์ */}
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>

                    {/* นำ username มาแสดง ตรง Appbar มุมขวาบน */}
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
                {/* Box ที่แสดงข้อความ ว่า Order History */}
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
                        Order History
                    </Typography>

                </Box>
            </Box>
            <Box
                sx={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    {/* Tab ข้างบนที่เขียนว่า Inprogress order , finished order, canceled order */}
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Inprogress order" />
                        <Tab label="Finished order" />
                        <Tab label="Canceled order" />
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <Box sx={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <Grid2 container spacing={2} sx={{ mt: '24px', display: 'flex', flexDirection: 'column' }}>
                            {/* ดึงข้อมูล BillID มาจาก ตัวแปร groupedOrders */}
                            {Object.keys(groupedOrders)
                                // ใส่ filter ไว้ ให้ดึงเฉพาะ ข้อมูล order ที่มี ค่า status ไม่เท่ากับ ยกเลิก และ เสร็จสิ้น นอกจากนี้คือดึงมาหมดเลย
                                .filter(billID => groupedOrders[billID].some(order => order.Status !== 'ยกเลิก' && order.Status !== 'เสร็จสิ้น'))
                                // ใส่ filter ไว้ ให้ดึงเฉพาะ ข้อมูลที่มี username === cname ใน orderdetail
                                .filter(billID => groupedOrders[billID][0]?.cname === userInfo.username) // เพิ่มฟิลเตอร์ตรวจสอบ username
                                // วนลูปการดึงข้อมูล order จาก BillID เดียวกัน
                                .map((billID) => {
                                    // ฟังก์ชันคำนวณราคารวมของ order ใน BillID เดียวกัน
                                    const totalPrice = groupedOrders[billID].reduce((acc, order) => acc + parseFloat(order.Price), 0);

                                    // สมมติว่า slip ของแต่ละ order เหมือนกัน ให้แสดงแค่ slip อันเดียวต่อ BillID
                                    const slipImage = groupedOrders[billID][0]?.SlipImage;

                                    // ดึงข้อมูลของ order ที่มี BillID เดียวกันมาแสดง
                                    const order = groupedOrders[billID][0];

                                    return (
                                        // Grid2 ไม่จำเป็นต้องใส่ความกว้างของ Grid แล้ว มันจัดการเอง
                                        <Grid2 key={billID} sx={{ border: '2px solid #EAAF18', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <Box>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', fontSize: '18px' }}>
                                                        {/* ดึงข้อมูล billID มาแสดง */}
                                                        Order ID: {billID}
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                        <AccountCircleIcon sx={{ color: 'skyblue', marginRight: '8px' }} />
                                                        {/* ดึงข้อมูล cname ของ order มาแสดง */}
                                                        Customer name: {order.cname}
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                        <LocationOnIcon sx={{ color: 'red', marginRight: '8px' }} />
                                                        {/* ดึงข้อมูล address ของ order มาแสดง */}
                                                        Address : {order.UserAddress}
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                        Status:
                                                        <span style={{ color: '#EAAF18' }}>
                                                            {/* ดึงข้อมูล status ของ order มาแสดง */}
                                                            {statusMap[order.BillID]}
                                                        </span>
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                        {/* ดึงข้อมูล DeliveryTime ของ order มาแสดง */}
                                                        Delivery Time: {order.DeliveryTime || 'ยังไม่มีข้อมูล'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Divider sx={{ width: '100%' }} />

                                            {/* ฟังก์ชั่นนี้เป็นการดึงข้อมูลแบบ loop ถ้า order นี้มี 2 สินค้า ก็จะ loop 2 ครั้ง โดยจะดึงจาก BillID เดียวกัน */}
                                            {groupedOrders[billID].map((order, index) => (
                                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                                    <Box>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>รายการ : &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูล menu ของ order มาแสดง */}
                                                                {order.menu}
                                                            </span>
                                                        </Typography>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>รูปแบบการทำอาหาร : &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูล service [รูปแบบการทำ] ของ order มาแสดง */}
                                                                {order.Service}
                                                            </span>
                                                        </Typography>

                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>ราคา: &nbsp;

                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูลราคาของ menu นั้นๆ ของ order มาแสดง */}
                                                                {order.Price}
                                                            </span>
                                                            &nbsp; บาท</Typography>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>น้ำหนัก: &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูลน้ำหนักของ menu นั้นๆที่ลูกค้าสั่ง ของ order มาแสดง */}
                                                                {order.Amount_per_kg}
                                                            </span>
                                                            &nbsp; kg</Typography>

                                                    </Box>
                                                </Box>
                                            ))}

                                            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '32px' }}>
                                                <Typography sx={{ marginLeft: 'auto', fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                    ราคารวมทั้งหมด:
                                                    <span style={{ color: 'green', fontWeight: '700' }}>
                                                        {/* ราคารวมของ order ทั้งหมด */}
                                                        {totalPrice.toFixed(2)}
                                                    </span>
                                                    บาท
                                                </Typography>
                                            </Box>

                                            {/* แสดง slip อันเดียวต่อ BillID */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
                                                <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>หลักฐานการโอน</Typography>
                                                <Button
                                                    onClick={() => handleImageClick(slipImage)}
                                                    sx={{
                                                        border: '1px solid #EAAF18',
                                                        height: '30px',
                                                        color: '#938667',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    Slip
                                                </Button>
                                            </Box>
                                        </Grid2>
                                    );
                                })}
                        </Grid2>
                    </Box>

                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <Box sx={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <Grid2 container spacing={2} sx={{ mt: '24px', display: 'flex', flexDirection: 'column' }}>
                            {/* ดึงข้อมูล BillID มาจาก ตัวแปร groupedOrders */}
                            {Object.keys(groupedOrders)
                                // ใส่ filter ไว้ ให้ดึงเฉพาะ ข้อมูล order ที่มี ค่า status เท่ากับ เสร็จสิ้น 
                                .filter(billID => groupedOrders[billID].some(order => order.Status === 'เสร็จสิ้น'))
                                // ใส่ filter ไว้ ให้ดึงเฉพาะ ข้อมูลที่มี username === cname ใน orderdetail
                                .filter(billID => groupedOrders[billID][0]?.cname === userInfo.username) // เพิ่มฟิลเตอร์ตรวจสอบ username
                                // วนลูปการดึงข้อมูล order จาก BillID เดียวกัน
                                .map((billID) => {
                                    // ฟังก์ชันคำนวณราคารวมของ order ใน BillID เดียวกัน
                                    const totalPrice = groupedOrders[billID].reduce((acc, order) => acc + parseFloat(order.Price), 0);

                                    // สมมติว่า slip ของแต่ละ order เหมือนกัน ให้แสดงแค่ slip อันเดียวต่อ BillID
                                    const slipImage = groupedOrders[billID][0]?.SlipImage;

                                    // ดึงข้อมูลของ order ที่มี BillID เดียวกันมาแสดง
                                    const order = groupedOrders[billID][0];

                                    return (
                                        // Grid2 ไม่จำเป็นต้องใส่ความกว้างของ Grid แล้ว มันจัดการเอง
                                        <Grid2 item xs={12} md={12} key={billID} sx={{ border: '2px solid green', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <Box>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', fontSize: '18px' }}>
                                                        {/* ดึงข้อมูล billID มาแสดง */}
                                                        Order ID: {billID}
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                        <AccountCircleIcon sx={{ color: 'skyblue', marginRight: '8px' }} />
                                                        {/* ดึงข้อมูล cname ของ order มาแสดง */}
                                                        Customer name: {order.cname}
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                        <LocationOnIcon sx={{ color: 'red', marginRight: '8px' }} />
                                                        {/* ดึงข้อมูล address ของ order มาแสดง*/}
                                                        Address : {order.UserAddress}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                        Status:
                                                        <span style={{ color: 'green' }}>
                                                            {/* ดึงข้อมูล status ของ order มาแสดง */}
                                                            {statusMap[order.BillID]}
                                                        </span>
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                        {/* ดึงข้อมูล DeliveryTime ของ order มาแสดง */}
                                                        Delivery Time: {order.DeliveryTime || 'ยังไม่มีข้อมูล'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* ฟังก์ชั่นนี้เป็นการดึงข้อมูลแบบ loop ถ้า order นี้มี 2 สินค้า ก็จะ loop 2 ครั้ง โดยจะดึงจาก BillID เดียวกัน */}                                            {groupedOrders[billID].map((order, index) => (
                                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                                    <Box>
                                                        {/* <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>Product ID: {order.PID}</Typography> */}
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>รายการ : &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูล menu ของ order มาแสดง */}
                                                                {order.menu}
                                                            </span>
                                                        </Typography>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>รูปแบบการทำอาหาร : &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูล service [รูปแบบการทำ] ของ order มาแสดง */}
                                                                {order.Service}
                                                            </span>
                                                        </Typography>

                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>ราคา: &nbsp;

                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูลราคาของ menu นั้นๆ ของ order มาแสดง */}
                                                                {order.Price}
                                                            </span>
                                                            &nbsp; บาท</Typography>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>น้ำหนัก: &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูลน้ำหนักของ menu นั้นๆที่ลูกค้าสั่ง ของ order มาแสดง */}
                                                                {order.Amount_per_kg}
                                                            </span>
                                                            &nbsp; kg</Typography>

                                                    </Box>
                                                </Box>
                                            ))}

                                            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '32px' }}>
                                                <Typography sx={{ marginLeft: 'auto', fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                    ราคารวมทั้งหมด:
                                                    <span style={{ color: 'green', fontWeight: '700' }}>
                                                        {/* ราคารวมของ order ทั้งหมด */}
                                                        {totalPrice.toFixed(2)}
                                                    </span>
                                                    บาท
                                                </Typography>
                                            </Box>

                                            {/* แสดง slip อันเดียวต่อ BillID */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
                                                <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>หลักฐานการโอน</Typography>
                                                <Button
                                                    onClick={() => handleImageClick(slipImage)}
                                                    sx={{
                                                        border: '1px solid #EAAF18',
                                                        height: '30px',
                                                        color: '#938667',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    Slip
                                                </Button>
                                            </Box>
                                        </Grid2>
                                    );
                                })}
                        </Grid2>
                    </Box>

                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <Box sx={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <Grid2 container spacing={2} sx={{ mt: '24px', display: 'flex', flexDirection: 'column' }}>
                            {/* ดึงข้อมูล BillID มาจาก ตัวแปร groupedOrders */}
                            {Object.keys(groupedOrders)
                                // ใส่ filter ไว้ ให้ดึงเฉพาะ ข้อมูล order ที่มี ค่า status เท่ากับ ยกเลิก
                                .filter(billID => groupedOrders[billID].some(order => order.Status === 'ยกเลิก'))
                                // ใส่ filter ไว้ ให้ดึงเฉพาะ ข้อมูลที่มี username === cname ใน orderdetail
                                .filter(billID => groupedOrders[billID][0]?.cname === userInfo.username) // เพิ่มฟิลเตอร์ตรวจสอบ username
                                // วนลูปการดึงข้อมูล order จาก BillID เดียวกัน
                                .map((billID) => {
                                    // ฟังก์ชันคำนวณราคารวมของ order ใน BillID เดียวกัน
                                    const totalPrice = groupedOrders[billID].reduce((acc, order) => acc + parseFloat(order.Price), 0);

                                    // สมมติว่า slip ของแต่ละ order เหมือนกัน ให้แสดงแค่ slip อันเดียวต่อ BillID
                                    const slipImage = groupedOrders[billID][0]?.SlipImage;

                                    // ดึงข้อมูลของ order ที่มี BillID เดียวกันมาแสดง
                                    const order = groupedOrders[billID][0];

                                    return (
                                        // Grid2 ไม่จำเป็นต้องใส่ความกว้างของ Grid แล้ว มันจัดการเอง
                                        <Grid2 item xs={12} md={12} key={billID} sx={{ border: '2px solid red', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <Box>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', fontSize: '18px' }}>
                                                        {/* ดึงข้อมูล billID มาแสดง */}
                                                        Order ID: {billID}
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                        <AccountCircleIcon sx={{ color: 'skyblue', marginRight: '8px' }} />
                                                        {/* ดึงข้อมูล cname ของ order มาแสดง */}
                                                        Customer name: {order.cname}
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                        <LocationOnIcon sx={{ color: 'red', marginRight: '8px' }} />
                                                        {/* ดึงข้อมูล address ของ order มาแสดง*/}
                                                        Address : {order.UserAddress}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                        Status:
                                                        <span style={{ color: 'red' }}>
                                                            {/* ดึงข้อมูล status ของ order มาแสดง */}
                                                            {statusMap[order.BillID]}
                                                        </span>
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                        {/* ดึงข้อมูล DeliveryTime ของ order มาแสดง */}
                                                        Delivery Time: {order.DeliveryTime || 'ยังไม่มีข้อมูล'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* ฟังก์ชั่นนี้เป็นการดึงข้อมูลแบบ loop ถ้า order นี้มี 2 สินค้า ก็จะ loop 2 ครั้ง โดยจะดึงจาก BillID เดียวกัน */}
                                            {groupedOrders[billID].map((order, index) => (
                                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                                    <Box>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>รายการ : &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูล menu ของ order มาแสดง */}
                                                                {order.menu}
                                                            </span>
                                                        </Typography>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>รูปแบบการทำอาหาร : &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูล service [รูปแบบการทำ] ของ order มาแสดง */}
                                                                {order.Service}
                                                            </span>
                                                        </Typography>

                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>ราคา: &nbsp;

                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูลราคาของ menu นั้นๆ ของ order มาแสดง */}
                                                                {order.Price}
                                                            </span>
                                                            &nbsp; บาท</Typography>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>น้ำหนัก: &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {/* ดึงข้อมูลน้ำหนักของ menu นั้นๆที่ลูกค้าสั่ง ของ order มาแสดง */}
                                                                {order.Amount_per_kg}
                                                            </span>
                                                            &nbsp; kg</Typography>

                                                    </Box>
                                                </Box>
                                            ))}

                                            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '32px' }}>
                                                <Typography sx={{ marginLeft: 'auto', fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                    ราคารวมทั้งหมด:
                                                    <span style={{ color: 'green', fontWeight: '700' }}>
                                                        {/* ราคารวมของ order ทั้งหมด */}
                                                        {totalPrice.toFixed(2)}
                                                    </span>
                                                    บาท
                                                </Typography>
                                            </Box>

                                            {/* แสดง slip อันเดียวต่อ BillID */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
                                                <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>หลักฐานการโอน</Typography>
                                                <Button
                                                    onClick={() => handleImageClick(slipImage)}
                                                    sx={{
                                                        border: '1px solid #EAAF18',
                                                        height: '30px',
                                                        color: '#938667',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    Slip
                                                </Button>
                                            </Box>
                                        </Grid2>
                                    );
                                })}
                        </Grid2>
                    </Box>

                </CustomTabPanel>
            </Box >
        </>


    )
}

export default OderUserHistory
