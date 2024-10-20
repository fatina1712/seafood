import * as React from "react";
import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import "@fontsource/ibm-plex-sans-thai";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Box, Grid2, Modal, Select, TextField, Typography, Divider } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import List from '@mui/material/List';
import imageCompression from 'browser-image-compression';

// import Modal from "@mui/material";


const Home = () => {
    const [cart, setCart] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [address, setAddress] = useState('');
    const [cname, setCname] = useState('');
    const [status, setStatus] = useState('กำลังดำเนินการ');
    const [slipImage, setSlipImage] = useState(null);
    const [deliveryTime, setDeliveryTime] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [userAddress, setUserAddress] = useState("");
    const [services, setServices] = React.useState([]);

    // ฟังก์ชั่น จำกัดเวลาการสั่งของลูกค้าให้อยู่ในเวลา 5:00 - 11:00
    const isDeliveryTimeValid = (time) => {
        const selectedDate = new Date(time);
        const hours = selectedDate.getUTCHours(); // หรือ getHours() ขึ้นอยู่กับโซนเวลา

        // ตรวจสอบว่าอยู่ในช่วงเวลา 5:00 AM ถึง 11:59 AM
        return hours >= 5 && hours <= 11;
    };

    // เอาไว้เปิดตัว icon avatar
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // ฟังก์ชั่นอัพโหลดรูป Slip
    const handleSlipImageChange = (event) => {
        setSlipImage(event.target.files[0]);
    };

    // ฟังก์ชั่นอัพโหลด เวลาการจัดส่ง
    const handleDeliveryTimeChange = (event) => {
        setDeliveryTime(event.target.value);
    };

    // ดึงข้อมูลจากฐานข้อมูลมาใส่ในตัวแปรนี้ แล้วเอาไปแสดง
    const [products, setProducts] = React.useState([]);

    // จำนวนกิโล
    const [amount, setAmount] = React.useState('0.0');

    // ฟังก์ชั่น เพิ่ม จำนวนน้ำหนักของสินค้า ตอนที่จะเลือกสินค้ากดใส่ตะกร้า
    const increase = (productId) => {
        setSelectedOptions((prev) => {
            const currentAmount = parseFloat(prev[productId]?.amount) || 0.0;
            return {
                ...prev,
                [productId]: {
                    ...prev[productId],
                    amount: (currentAmount + 0.1).toFixed(1),
                },
            };
        });
    };

    // ฟังก์ชั่น ลด จำนวนน้ำหนักของสินค้า ตอนที่จะเลือกสินค้ากดใส่ตะกร้า
    const decrease = (productId) => {
        setSelectedOptions((prev) => {
            const currentAmount = parseFloat(prev[productId]?.amount) || 0.0;
            const newAmount = currentAmount - 0.1;
            return {
                ...prev,
                [productId]: {
                    ...prev[productId],
                    amount: newAmount > 0 ? newAmount.toFixed(1) : '0.0',
                },
            };
        });
    };

    // ฟังก์ชั่นเลือกรูปแบบการทำ
    const handleCookTypeChange = (productId, event) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                cookType: event.target.value,
            },
        }));
    };

    // ฟังก์ชั่นเอาข้อมูลสินค้าที่เลือก ไปยังตัวแปร setCart
    const addToCart = (product) => {
        const options = selectedOptions[product.pid];
        if (!options || parseFloat(options.amount) === 0 || !options.cookType) {
            alert('กรุณาเลือกน้ำหนักและรูปแบบการทำก่อนเพิ่มสินค้าในตะกร้า'); // Please select weight and cooking style before adding to cart
            return;
        }

        setCart((prevCart) => {
            // Check if the product with the same options already exists in the cart
            const existingIndex = prevCart.findIndex(
                (item) =>
                    item.product.pid === product.pid &&
                    item.cookType === options.cookType
            );

            if (existingIndex !== -1) {
                // Update the amount if it exists
                const updatedCart = [...prevCart];
                updatedCart[existingIndex].amount = (
                    parseFloat(updatedCart[existingIndex].amount) +
                    parseFloat(options.amount)
                ).toFixed(1);
                return updatedCart;
            } else {
                // Add new item to the cart
                return [
                    ...prevCart,
                    {
                        product,
                        amount: options.amount,
                        cookType: options.cookType,
                    },
                ];
            }
        });


        // Reset selected options for the product
        setSelectedOptions((prev) => ({
            ...prev,
            [product.pid]: { amount: '0.0', cookType: '' },
        }));

        alert('เพิ่มสินค้าในตะกร้าเรียบร้อยแล้ว'); // Product added to cart successfully
    };

    const handleCartOpen = () => {
        setIsCartOpen(true);
    };

    const handleCartClose = () => {
        setIsCartOpen(false);
    };

    // ฟังก์ชั่นลบข้อมูลที่มีอยู่ใน Cart ออก
    const handleRemoveFromCart = (index) => {
        setCart((prevCart) => prevCart.filter((_, i) => i !== index));
    };


    // กำหนดตัวแปรรูปแบบการทำ
    const [cookType, setCookType] = React.useState("");

    const fetchServices = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/service');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

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

    // ฟังก์ชั่น navigate ไป /orderhistory
    const handleHistory = () => {
        navigate('/orderhistory');
    }

    // ฟังก์ชั่นนี้เป็นการเอาข้อมูล ที่ได้จากใน Cart เอาลงไปใน Database ตาราง orderdetail
    const saveCartToDatabase = async () => {
        // เช็คว่าเข้าสู่ระบบหรือยังก่อนจะสั่ง
        if (!userInfo) {
            alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
            return;
        }

        // if (!isDeliveryTimeValid(deliveryTime)) {
        //     alert('เวลาการจัดส่งจะอยู่ในช่วง 5:00 AM ถึง 11:59 AM');
        //     return;
        // }

        // ดึงข้อมูลจาก cart ที่ setCart มาจากฟังก์ชั่น addToCart
        const orders = cart.map(item => ({
            PID: item.product.pid,
            menu: item.product.menu,
            cname: userInfo.cname,
            Amount_per_kg: item.amount,
            Price: (item.product.price_per_kg * item.amount).toFixed(2),
            Service: item.cookType,
            UserAddress: userInfo.address,
            // status set ค่าเริ่มต้นไว้ว่าเป็น กำลังดำเนินการ
            Status: 'กำลังดำเนินการ',
        }));

        const formData = new FormData();
        formData.append('slipImage', slipImage);
        formData.append('deliveryTime', deliveryTime);
        formData.append('orders', JSON.stringify(orders)); // แปลง orders เป็น JSON string

        try {
            const response = await axios.post('http://localhost:3000/api/order', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                alert('สั่งซื้อสำเร็จแล้ว');
                console.log('Order BillID:', response.data.BillID);
                // อาจล้างตะกร้าหรือเปลี่ยนเส้นทางที่นี่
                setIsCartOpen(false);
                setCart([]);
            } else {
                alert('เกิดข้อผิดพลาดในการสั่งซื้อ');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('เกิดข้อผิดพลาดในการสั่งซื้อ');
        }
    };

    // ตัวแปรเก็บข้อมูล orders คือข้อมูล ตาราง orderdetail 
    const [orders, setOrders] = useState([]);

    // ดึงข้อมูล order มาแสดง
    useEffect(() => {

        if (userInfo?.username) {
            const fetchOrders = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/api/orders?username=${userInfo.username}`);
                    setOrders(response.data);

                    const initialStatusMap = {};
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                }
            };
            fetchOrders();
        }
    }, [userInfo]);

    const uniqueReviews = orders.reduce((acc, order) => {
        if (!acc[order.BillID]) {
            acc[order.BillID] = { review: order.review, cname: order.cname }; // เก็บรีวิวและ cname
        }
        return acc;
    }, {});



    return (
        <>
            {/* AppBar บนสุด แสดง โลโก้ ช่องเสิร์ช ตะกร้า ราคา รูปอวตาร์ */}
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
                            marginLeft: 'auto',
                            position: 'relative',
                        }}
                        onClick={handleCartOpen}
                    >
                        <ShoppingCartIcon
                            sx={{
                                marginRight: '8px',
                            }}
                        />
                        ฿
                        {/* อันนี้เป็นตัวแสดงว่า จำนวน ออเดอร์ที่สั่งไปมีกี่ออเดอร์ ถ้าสั่งไป 2 อย่างก็จะขึ้น 2  */}
                        {cart.length > 0 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    backgroundColor: 'red',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                }}
                            >
                                {cart.length}
                            </Box>
                        )}
                        {/* แสดงราคาสินค้ารวม */}
                        <Box
                            sx={{
                                marginLeft: '8px',
                                fontSize: '16px',
                                fontFamily: 'IBM Plex Sans Thai',
                            }}
                        >
                            {/* ราคาสินค้าที่คำนวณแล้ว */}
                            {cart.reduce((total, item) => total + parseFloat(item.product.price_per_kg) * parseFloat(item.amount), 0).toFixed(2)}
                        </Box>
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
                        <MenuItem onClick={handleHistory}>History</MenuItem>
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

            {/* รูปแบนเนอร์ */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',

                }}
            >
                <img
                    src="/shopdetail.png"
                />
            </Box>
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
                {/* ที่ต้องสร้าง Box แยกเพราะจะจัดข้อมูลข้างในได้ง่ายกว่า */}

                {/* Box นี้แสดงข้อมูลของสินค้า โดยมี display:flex , alignitems:center เพื่อให้ข้อมูลอยู่ตรงกลางแบบสวยๆ และ flexdirection:column เพื่อให้ข้อมูลแสดงจากบนลงล่าง ถ้า row จะเป็นซ้ายไปขวา */}
                <Box sx={{ display: 'flex', alignItems: 'center', width: '60%', flexDirection: 'column', justifyContent: 'center' }}>
                    {/* mx:'auto' คือการกำหนดระยะห่างระหว่าง Grid2 ที่อยู่ใน Grid2 container อันนี้ให้มีขนาดเท่าๆกัน */}
                    <Grid2 container spacing={4} sx={{ mx: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {/* ดึงข้อมูล product มาโชว์ โดยการ map จาก useEffect ข้างบน */}
                        {products.map((product) => {

                            // อันนี้ก็คือเอา ทุกอย่างที่เลือกในหน้า Home ไปใส่ในตัวแปร selectedOptions
                            const options = selectedOptions[product.pid] || { amount: '0.0', cookType: '' };

                            // ค้นหา services ที่ตรงกับ type ของ product
                            const relatedServices = services.filter(service => service.type === product.type);

                            return (

                                <Grid2 item key={product.pid}>

                                    <Box
                                        sx={{
                                            width: "100%",
                                            borderRadius: "30px",
                                            border: "3px solid #EAAF18",
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
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
                                            {/* ปุ่มลดจำนวนกิโล เมื่อคลิก ฟังก์ชั่น decrease จะทำงาน เพราะ กำหนด onclick={decrease} ไว้ */}
                                            <IconButton onClick={() => decrease(product.pid)} sx={{ height: '32px', width: '32px', marginRight: '18px' }}>
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
                                                    {options.amount}
                                                </Typography>
                                            </Box>

                                            {/* ปุ่มเพิ่มจำนวนกิโล เมื่อคลิก ฟังก์ชั่น increase จะทำงาน เพราะ กำหนด onclick={increase} ไว้ */}
                                            <IconButton onClick={() => increase(product.pid)} sx={{ height: '32px', width: '32px', marginLeft: '18px' }}>
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


                                            {/* Select สำหรับเลือกบริการที่เกี่ยวข้อง */}
                                            <Select
                                                value={options.service}
                                                onChange={(e) => handleCookTypeChange(product.pid, e)}
                                                displayEmpty
                                                renderValue={(selected) => {
                                                    if (!selected) {
                                                        return <>เลือกรูปแบบการทำอาหาร</>;
                                                    }
                                                    return selected;
                                                }}
                                                sx={{
                                                    height: '33px',
                                                    width: '202px',
                                                    border: '1px solid #EAAF18',
                                                    borderRadius: '10px',
                                                    bgcolor: 'white'
                                                }}
                                            >
                                                <MenuItem value="" disabled>
                                                    เลือกรูปแบบการทำอาหาร
                                                </MenuItem>
                                                {relatedServices.map(service => (
                                                    <MenuItem key={service.id} value={service.service_name}>
                                                        {service.service_name}
                                                    </MenuItem>
                                                ))}
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
                                                onClick={() => addToCart(product)}
                                                sx={{
                                                    height: '44px',
                                                    bgcolor: product.status === 0 ? '#EAAF18' : '#EAAF18', // ปรับสีให้เหมือนเดิม
                                                    border: '1px solid #524B38',
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    color: '#FFFFFF',
                                                    fontFamily: "IBM Plex Sans Thai",
                                                    borderRadius: '10px',
                                                    padding: '0px 24px',
                                                    '&:hover': {
                                                        bgcolor: '#d9a818',
                                                    },
                                                    pointerEvents: product.status === 0 ? 'none' : 'auto', // Disable ปุ่มถ้า status == 0
                                                }}
                                                disabled={product.status === 0} // ทำให้ปุ่ม disabled ถ้า status == 0
                                            >
                                                {product.status === 0 ? 'หมด' : 'ใส่ตะกร้า'} {/* เปลี่ยนข้อความให้ตรงกับสถานะ */}
                                            </Button>

                                        </Box>

                                    </Box>
                                </Grid2>
                            );
                        })}
                    </Grid2>
                </Box>

                <Divider sx={{ width: '100%', mt: '24px', mb: '24px' }} />
                <Box>
                    <Typography sx={{ fontSize: '24px', fontWeight: '700', fontFamily: 'IBM Plex Sans Thai' }}>
                        รีวิว
                    </Typography>
                </Box>

                <Box sx={{ border: '2px solid green', borderRadius: '10px', padding: '16px', mt: '16px', width: '60%' }}>
                    {Object.keys(uniqueReviews).map(billID => (
                        uniqueReviews[billID].review ? ( // ตรวจสอบว่ารีวิวมีค่าหรือไม่
                            <Typography key={billID} sx={{ fontFamily: 'IBM Plex Sans Thai', fontSize: '18px', color: 'black' }}>
                                <strong>{uniqueReviews[billID].cname} </strong> {/* แสดง cname */}
                                <strong>รีวิว : </strong>{uniqueReviews[billID].review} {/* แสดง review */}
                            </Typography>
                        ) : null
                    ))}
                </Box>


            </Box>

            {/* Modal [popup] ของตะกร้า เมื่อกด รูปตะกร้าบน Appbar ด้านบนขวา ฟังก์ชั่น isCartOpen ทำงาน และ จะปิดเมื่อ handleCartClose ทำงาน */}
            <Modal open={isCartOpen} onClose={handleCartClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                    sx={{
                        width: { xs: '70%', sm: '60%', md: '50%' },
                        bgcolor: 'background.paper',
                        borderRadius: '8px',
                        boxShadow: 24,
                        p: 4,
                        maxHeight: '90vh',
                        overflowY: 'auto',

                    }}
                >
                    <Typography variant="h6" component="h2" sx={{ mb: 2, fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                        ตะกร้าสินค้า
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

                        {/* อันนี้ตรวจว่า cart.lenght คือ มีข้อมูลอยู่ในตะกร้ามั้ย ถ้าไม่มีจะขึ้นข้อความด้านล่าง แต่ถ้ามีก็จะแสดง List ของ order */}
                        {cart.length === 0 ? (
                            <Typography>ตะกร้าของคุณยังว่างเปล่า</Typography>
                        ) : (
                            <List sx={{ width: '100%' }}>
                                {/* วนลูปข้อมูลที่มีอยู่ใน cart */}
                                {cart.map((item, index) => (
                                    <Box key={index} sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                                        <Box sx={{
                                            width: '100%',
                                            borderRadius: '30px',
                                            border: '3px solid #EAAF18',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '16px',
                                            backgroundColor: '#f9f9f9',
                                        }}>
                                            <Box sx={{ width: '100px', height: '100px', overflow: 'hidden' }}>
                                                <img
                                                    // ดึงรูปของสินค้่ามาแสดง
                                                    src={item.product.productimage}
                                                    alt={item.product.menu}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                                                />
                                            </Box>
                                            <Box sx={{ ml: 'auto', textAlign: 'end' }}>
                                                <Typography sx={{ fontSize: '20px', fontWeight: '700', color: '#938667', fontFamily: 'IBM Plex Sans Thai', }}>
                                                    {/* ดึงข้อมูลของ menu มาแสดง */}
                                                    {item.product.menu}
                                                </Typography>
                                                <Typography sx={{ fontSize: '18px', fontWeight: '600', color: '#EAAF18', fontFamily: 'IBM Plex Sans Thai', }}>
                                                    {/* ดึงข้อมูลจำนวนมาแสดง */}
                                                    {item.amount} กิโลกรัม
                                                </Typography>
                                                <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>฿{(item.product.price_per_kg * item.amount).toFixed(2)}</Typography>
                                                <Button
                                                    // ฟังก์ชั่นลบข้อมูลออกจากตะกร้า ถ้ากดปุ่มนี้ก็คือ ลบ ข้อมูลที่เลือกที่อยู่ในตะกร้าออก
                                                    onClick={() => handleRemoveFromCart(index)}
                                                    sx={{ ml: 2, color: 'red', fontFamily: 'IBM Plex Sans Thai', fontWeight: '700' }}
                                                >
                                                    ลบ
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}

                            </List>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img
                            src="/qrcode.jpg"
                            style={{
                                width: '300px',
                                height: '300px',
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', marginTop: '24px' }}>
                        <Box>
                            <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                แนบหลักฐานการโอนเงิน
                            </Typography>
                            {/* อันนี้จะเป็น tag input เอาไว้อัพโหลดรูปสลิป เมื่ออัพโหลดเสร็จแล้วฟังก์ชั่น handleSlipImageChange จะทำงาน ก็คือเอารูปที่เลือกเข้าไปในตัวแปร slipImage */}
                            <input type="file" accept="image/*" onChange={handleSlipImageChange} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                เลือกเวลาการจัดส่ง
                            </Typography>
                            {/* อันนี้เป็น tag input เพื่อเลือกเวลาการจัดส่ง เมื่อเลือกแล้วฟังก์ชั่น handleDeliveryTimeChange จะทำงาน ก็คือเอาข้อมูลเวลาที่เลือกเข้าไปในตัวแปร deliveryTime */}
                            {/* จะเห็นว่าทั้งการอัพโหลดรูป slip กับ เวลา มันใช้ tag input เหมือนกัน */}
                            {/* แต่มันต่างกันตรงที่ type ข้างบนจะเป็น file เอาไว้อัพโหลดไฟล์ อันนี้จะเป็น datetime-local คือจะเอาไว้เลือก วัน เวลา */}
                            <input type="datetime-local" onChange={handleDeliveryTimeChange} />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', ml: 'auto', mt: 3 }}>
                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                            ทั้งหมด
                            <span style={{ fontWeight: '700', color: 'red', marginLeft: '8px', marginRight: '8px' }}>
                                {/* อันนี้คือการคำนวณราคารวมทั้งหมดของออเดอร์ ใช้สูตรตามนี้ */}
                                {cart.reduce((total, item) => total + parseFloat(item.product.price_per_kg) * parseFloat(item.amount), 0).toFixed(2)}
                            </span>
                            บาท
                        </Typography>
                        <Button
                            // เมื่อคลิกปุ่มนี้จะทำการ save ข้อมูลที่อยู่ในตะกร้าทั้งหมด เข้า database ตาราง orderdetail
                            onClick={saveCartToDatabase}
                            sx={{ ml: 'auto', fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}
                        >
                            สั่งซื้อ
                        </Button>
                        <Button
                            // ถ้าคลิกปุ่มนี้จะปิดตะกร้า
                            onClick={() => setIsCartOpen(false)}
                            sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}
                        >
                            ปิด
                        </Button>
                    </Box>
                </Box>
            </Modal>

        </>
    );
};

export default Home;
