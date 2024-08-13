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

    // ดึงข้อมูลสินค้ามาโชว์
    useEffect(() => {
        axios.get('http://localhost:3000/api/data')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the data!", error);
            });
    }, []);

    // ดึงข้อมูลผู้ใช้ปัจจุบันมาใช้ ด้วย token
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

    // logout ด้วยการลบ token ออก ทำให้ไม่มีข้อมูล token ของปัจจุบันอยู่ ถ้าอยากให้มี token ใหม่ก็ login ใหม่
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

    // ฟังก์ชั่น navigate ไป /userinfo
    const handleUserinfo = () => {
        navigate('/userinfo');
    };

    // ฟังก์ชั่น navigate ไป /home
    const handleHome = () => {
        navigate('/home');
    };

    return (
        <>
            {/* AppBar บนสุด แสดง โลโก้ ช่องเสิร์ช ตะกร้าราคา รูปอวตาร์ */}
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

                    {/* รูปโลโก้ของร้านดึงมาจาก folder public */}
                    <img src="/logo.png" style={{ height: "80px", width: "80px", marginLeft: 'auto' }} />

                    {/* ช่องเสิร์ช พิมพ์ได้เฉยๆไม่สามารถค้นหาได้เพราะยังไม่ได้กำหนดค่าอะไร */}
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

                    {/* ปุ่มตะกร้า แสดงจำนวนราคาของสินค้า */}
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

                        {/* โลโก้ตะกร้าสินค้า */}
                        <ShoppingCartIcon
                            sx={{
                                marginRight: '48px'
                            }}
                        />

                        ฿
                    </Button>

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

                    {/* เมื่อคลิกตรงรูปอวตาร์ จะแสดงเมนูดังนี้  */}
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
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>

                    {/* ดึงข้อมูล ชื่อผู้ใช้งาน มาโชว์ โดยดึงจาก token ว่าตอนนี้ token ใน browser ที่ได้เมื่อล็อกอิน ตรงกับ token ของผู้ใช้คนไหนใน database ก็จะนำข้อมูลของคนๆนั้นมาแสดง */}
                    {userInfo && (
                        <Typography sx={{ color: "#FFFFFF", marginLeft: "16px", fontSize: "20px", fontWeight: "700", fontFamily: "IBM Plex Sans Thai", marginRight: 'auto' }}>
                            {userInfo.username}
                        </Typography>
                    )}
                </Toolbar>
            </AppBar>

            {/* AppBar ที่สอง แสดงปุ่มต่างๆ ใช้ได้แค่ปุ่ม home ปุ่มเดียว */}
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

                    {/* ปุ่ม Home เมื่อคลิกแล้วจะนำมาหน้า Home /home */}
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

                    {/* ปุ่มสินค้า */}
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

                    {/* ปุ่มคำถามที่พบบ่อย */}
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

                    {/* ปุ่มติดต่อเรา */}
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

                    {/* ปุ่มเงื่อนใขการให้บริการ */}
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

            {/* Box นี้เป็น Box ใหญ่ ที่อยู่ข้างหลังของทุกอย่างที่โชว์ในหน้า home */}
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
                {/* Box แสดงคำว่า สั่งสินค้า */}
                {/* ที่ต้องสร้าง Box แยกเพราะจะจัดข้อมูลข้างในได้ง่ายกว่า */}
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

                    {/* สั่งสินค้า */}
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

                {/* Box นี้แสดงข้อมูลของสินค้า โดยมี display:flex , alignitems:center เพื่อให้ข้อมูลอยู่ตรงกลางแบบสวยๆ และ flexdirection:column เพื่อให้ข้อมูลแสดงจากบนลงล่าง ถ้า row จะเป็นซ้ายไปขวา */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: '24px', width: '80%', flexDirection: 'column' }}>
                    {/* mx:'auto' คือการกำหนดระยะห่างระหว่าง Grid ที่อยู่ใน Grid container อันนี้ให้มีขนาดเท่าๆกัน */}
                    <Grid container sx={{ mx: 'auto' }}>
                        {/* ดึงข้อมูล product มาโชว์ โดยการ map จาก useEffect ข้างบน */}
                        {products.map((product) => (

                            // ใช้ Grid เพื่อจัดระเบียบ responsive ถ้าหน้าจอใหญ่จะแสดง 3 สินค้า ถ้าเล็กลง จะแสดง 2 ถ้าเล็กเท่าขนาดโทรศัพท์จะแสดงแค่ 1 สินค้า
                            // Grid จะมีความกว้าง 12 ช่อง เราสามารถกำหนดได้ว่าหน้าจอขนาดไหนจะให้ Grid ตัวนี้มีความกว้างเท่าไหร่
                            // ตัวอย่าง xl={4} คือแสดงได้ 3 Grid เพราะ 4 + 4 + 4 = 12
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
                                        {/* ดึงรูปของเมนูมา โดยอิงจาก เมนู */}
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
                                        {/* ดึงชื่อเมนูมา */}
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
                                        {/* ดึงราคาของเมนูนั้นๆมา */}
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
                                        {/* ปุ่มลดจำนวนกิโล เมื่อคลิก ฟังก์ชั่น increase จะทำงาน เพราะ กำหนด onclick={decrease} ไว้ */}
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
                                            {/* นำ amount มาแสดงโดยใช้ {ตัวแปร} */}
                                            <Typography>
                                                {amount}
                                            </Typography>
                                        </Box>

                                        {/* ปุ่มเพิ่มจำนวนกิโล เมื่อคลิก ฟังก์ชั่น increase จะทำงาน เพราะ กำหนด onclick={increase} ไว้ */}
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


                                        {/* Select เลือกรูปแบบการทำ */}
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
                                            {/* ถ้าข้อมูลใน cookType เป็น "" ให้แสดงข้อความว่า เลือกรูปแบบการทำ ซึ่งเรากำหนดค่าเริ่มต้นของ cookType เป็น "" อยู่แล้ว */}
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
        </>
    );
};

export default Home;
