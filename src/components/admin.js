import * as React from "react";
import { useEffect, useState } from "react";
import { Box, Grid2, Typography, Select, MenuItem, Modal, Button, Divider } from "@mui/material";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditProduct from "./editproduct";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // นำเข้าความสวยงามของ DatePicker

// ฟังก์ชั่น CustomTabPanel ของ Material UI [MUI]
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

function Admin() {
    // ตัวแปรเก็บข้อมูล userInfo คือข้อมูล ตาราง users 
    const [userInfo, setUserInfo] = useState(null);
    // ตัวแปรเก็บข้อมูล orders คือข้อมูล ตาราง orderdetail 
    const [orders, setOrders] = useState([]);
    // ตัวแปรเก็บข้อมูล status เอาไว้ อัพเดท status 
    const [statusMap, setStatusMap] = useState({});
    // navigate เอาไว้ สร้างฟังก์ชั่นลิงค์ไปหน้าอื่น
    const navigate = useNavigate();
    // ตัวแปร value เอาไว้เซ็ตค่าของ CustomPanelTab ของ MUI เพื่อจะให้มันเปลี่ยนหน้าไปมาได้
    const [value, setValue] = React.useState(0);
    // ตัวแปรนี้เอาไว้ เปิด Modal [pop-up] ที่มีรูป slip ของลูกค้า
    const [open, setOpen] = useState(false);
    // ตัวแปรนี้เอาไว้เก็บข้อมูล slip ของลูกค้า ในแต่ละ order
    const [selectedImage, setSelectedImage] = useState('');

    // state นี้เอาไว้เปิดรูป slip ของลูกค้า แต่ละ order
    const handleImageClick = (imageUrl) => {
        // อันนี้คือการดึงข้อมูล imageUrl จาก database มาใส่ไว้ในตัวแปร selectedimage เพื่อนำไปแสดงตอนกดดู slip
        setSelectedImage(imageUrl);
        // เปิด Modal [pop-up] ของ slip ที่มีรูป slip จาก selectedimage แสดงอยู่
        setOpen(true);
    };

    // ฟังก์ชั่น navigate ไปยังหน้า Edit
    const handleEditPage = () => {
        navigate('/editproduct');
    }

    // ปิด Modal ที่มีรูป slip 
    const handleClose = () => {
        setOpen(false);
    };

    // เอาไว้เปลี่ยนค่าของ value เมื่อกด แถบแสดงสถานะของ order ทั้ง 3
    const handleChange = (event, newValue) => {
        // โดยจะเซ็ท value ให้ = แถบที่เราคลิกไป
        setValue(newValue);
    };

    // ดึงข้อมูลของ user มาแสดง
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

    // ดึงข้อมูล order มาแสดง
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

    // ฟังก์ชั่นเปลี่ยน status ของ order
    const handleStatusChange = async (orderID, newStatus) => {
        try {
            await axios.put(`http://localhost:3000/api/orders/${orderID}`, { Status: newStatus }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setStatusMap(prev => ({ ...prev, [orderID]: newStatus }));
        } catch (error) {
            console.error("Failed to update order status:", error);
        }
    };

    // ข้างล่างนี้ที่มีคำว่า Service เป็นการเพิ่ม ลบ แก้ไขของ service ทั้งหมด
    const [services, setServices] = React.useState([]);
    const [newService, setNewService] = React.useState({ service_name: '', type: '' });
    const [openAddService, setOpenAddService] = React.useState(false);

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

    const handleAddService = () => {
        axios.post('http://localhost:3000/api/service', newService)
            .then(() => {
                fetchServices(); // ดึงข้อมูลบริการใหม่
                handleCloseAddService();
            })
            .catch(error => {
                console.error('Error adding service:', error);
            });
    };

    const handleDeleteService = (id) => {
        axios.delete(`http://localhost:3000/api/service/${id}`)
            .then(() => {
                fetchServices(); // ดึงข้อมูลบริการใหม่
            })
            .catch(error => {
                console.error('Error deleting service:', error);
            });
    };

    const handleEditService = (id, updatedService) => {
        axios.put(`http://localhost:3000/api/service/${id}`, updatedService)
            .then(() => {
                fetchServices(); // ดึงข้อมูลบริการใหม่
            })
            .catch(error => {
                console.error('Error updating service:', error);
            });
    };


    const handleServiceChange = (e) => {
        const { name, value } = e.target;
        setNewService({ ...newService, [name]: value });
    };

    const handleCloseAddService = () => {
        setOpenAddService(false);
    };

    const calculateTotals = (startDate, endDate) => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // ตั้งค่าเวลาเป็น 00:00:00
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0); // ตั้งค่าเวลาเป็น 00:00:00

        let totalToday = 0;
        let totalLast7Days = 0; // ยอดเงินย้อนหลัง 7 วัน
        let totalThisDay = 0; // ยอดเงินวันนี้

        // คำนวณยอดเงินย้อนหลัง 7 วัน
        for (let i = 0; i < 7; i++) {
            const dateToCheck = new Date();
            dateToCheck.setDate(dateToCheck.getDate() - i);
            dateToCheck.setHours(0, 0, 0, 0);

            let dailyTotal = 0; // ยอดเงินในวันนั้น

            Object.keys(groupedOrders).forEach(billID => {
                groupedOrders[billID].forEach(order => {
                    const orderDate = new Date(order.DeliveryTime);
                    orderDate.setHours(0, 0, 0, 0);

                    if (order.Status === 'เสร็จสิ้น') {
                        // เช็คว่าอยู่ในช่วงวันที่เลือก
                        if (orderDate >= start && orderDate <= end) {
                            dailyTotal += parseFloat(order.Price);
                        }
                    }
                });
            });

            totalLast7Days += dailyTotal;

            // เช็คยอดวันนี้
            if (dateToCheck.getTime() === start.getTime()) {
                totalToday = dailyTotal;
            }
        }

        // คำนวณยอดเงินเฉพาะวันนี้
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        Object.keys(groupedOrders).forEach(billID => {
            groupedOrders[billID].forEach(order => {
                const orderDate = new Date(order.DeliveryTime);
                orderDate.setHours(0, 0, 0, 0);

                if (order.Status === 'เสร็จสิ้น' && orderDate.getTime() === today.getTime()) {
                    totalThisDay += parseFloat(order.Price);
                }
            });
        });

        return { totalToday, totalThisDay, totalLast7Days };
    };

    const [selectedStartDate, setSelectedStartDate] = useState(new Date()); // วันที่เลือกเริ่มต้น
    const [selectedEndDate, setSelectedEndDate] = useState(new Date()); // วันที่เลือกสิ้นสุด
    const [totalAmount, setTotalAmount] = useState({ totalToday: 0, totalThisDay: 0, totalLast7Days: 0 });

    // ฟังก์ชันคำนวณยอดเงินในช่วงวันที่เลือก
    const calculateAmountForSelectedDates = () => {
        const amount = calculateTotals(selectedStartDate, selectedEndDate); // ใช้วันที่ที่เลือกในการคำนวณยอดเงิน
        setTotalAmount(amount);
    };

    useEffect(() => {
        const amount = calculateTotals(selectedStartDate, selectedEndDate);
        // อัปเดต state เฉพาะเมื่อค่าที่คำนวณได้เปลี่ยนแปลง
        if (
            amount.totalToday !== totalAmount.totalToday ||
            amount.totalThisDay !== totalAmount.totalThisDay ||
            amount.totalLast7Days !== totalAmount.totalLast7Days
        ) {
            setTotalAmount(amount);
        }
    }, [groupedOrders, selectedStartDate, selectedEndDate]); // รวม dependency ทั้งหมด


    return (
        <>
            <img
                onClick={handleEditPage}
                src="/กรอบบนสุด.png"
                style={{ width: '100%', cursor: 'pointer' }}
            />

            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
                                .sort((a, b) => b.localeCompare(a, undefined, { numeric: true })) // เรียงจากมากไปน้อย
                                // ใส่ filter ไว้ ให้ดึงเฉพาะ ข้อมูล order ที่มี ค่า status ไม่เท่ากับ ยกเลิก และ เสร็จสิ้น นอกจากนี้คือดึงมาหมดเลย
                                .filter(billID => groupedOrders[billID].some(order => order.Status !== 'ยกเลิก' && order.Status !== 'เสร็จสิ้น'))
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
                                                        Customer name : {order.cname} 
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
                                                        Delivery Time: {order.DeliveryTime ? new Date(order.DeliveryTime).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : 'ยังไม่มีข้อมูล'}
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
                                                {/* อันนี้เป็น DropDown ของตัว status  */}
                                                <Select
                                                    value={statusMap[billID]}
                                                    // เมื่อเปลี่ยนข้อมูลใน DropDown นี้ status ของทุก order ที่อยู่ใน BillID เดียวกันจะเปลี่ยนไปตามที่เราเลือก
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        setStatusMap(prev => ({ ...prev, [billID]: newStatus }));
                                                        handleStatusChange(billID, newStatus);
                                                    }}
                                                    sx={{ mt: 2, height: '40px' }}
                                                >
                                                    <MenuItem value="กำลังดำเนินการ">กำลังดำเนินการ</MenuItem>
                                                    <MenuItem value="ชำระเงินเรียบร้อย">ชำระเงินเรียบร้อย</MenuItem>
                                                    <MenuItem value="รับออเดอร์">รับออเดอร์</MenuItem>
                                                    <MenuItem value="จัดเตรียมของสำเร็จ">จัดเตรียมของสำเร็จ</MenuItem>
                                                    <MenuItem value="กำลังจัดส่ง">กำลังจัดส่ง</MenuItem>
                                                    <MenuItem value="เสร็จสิ้น">เสร็จสิ้น</MenuItem>
                                                    <MenuItem value="ยกเลิก">ยกเลิก</MenuItem>
                                                </Select>
                                                <Typography sx={{ marginLeft: 'auto', fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                    ราคารวมทั้งหมด:
                                                    <span style={{ color: 'green', fontWeight: '700' }}>
                                                        {/* ราคารวมของ order ทุก order ที่มี BillID เดียวกัน */}
                                                        {totalPrice.toFixed(2)}
                                                    </span>
                                                    บาท
                                                </Typography>
                                            </Box>

                                            {/* แสดง slip อันเดียวต่อ BillID */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
                                                <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>หลักฐานการโอน</Typography>
                                                <Button
                                                    // เมื่อคลิ๊กปุ่มนี้ ฟังก์ชั่น handleImageClick จะทำงาน ก็คือ ฟังก์ชั่น ดึงข้อมูล slip มาแสดง
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
                        <Box sx={{ border: '2px solid green', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <DatePicker
                                    selected={selectedStartDate}
                                    onChange={(date) => {
                                        setSelectedStartDate(date);
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    isClearable
                                    placeholderText="เลือกวันที่เริ่มต้น"
                                />
                                <Typography>ยอดเงินวันที่เลือก: {totalAmount.totalToday.toFixed(2) || 0} บาท</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <DatePicker
                                    selected={selectedEndDate}
                                    onChange={(date) => {
                                        setSelectedEndDate(date);
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    isClearable
                                    placeholderText="เลือกวันที่สิ้นสุด"
                                />
                                <Typography>ยอดเงินวันนี้: {totalAmount.totalThisDay.toFixed(2) || 0} บาท</Typography>
                            </Box>
                        </Box>


                        <Grid2 container spacing={2} sx={{ mt: '24px', display: 'flex', flexDirection: 'column' }}>
                            {Object.keys(groupedOrders)
                                // ใส่ filter ไว้ ให้ดึงเฉพาะ ข้อมูล order ที่มี ค่า status เท่ากับ เสร็จสิ้น
                                .filter(billID => groupedOrders[billID].some(order => order.Status === 'เสร็จสิ้น'))
                                .filter(billID => {
                                    return groupedOrders[billID].some(order => {
                                        const orderDate = new Date(order.DeliveryTime);
                                        orderDate.setHours(0, 0, 0, 0); // ตั้งค่าเวลาให้เป็น 00:00:00
                                        const startDate = new Date(selectedStartDate);
                                        startDate.setHours(0, 0, 0, 0); // ตั้งค่าเวลาให้เป็น 00:00:00
                                        const endDate = new Date(selectedEndDate);
                                        endDate.setHours(23, 59, 59, 999); // ตั้งค่าเวลาให้เป็น 23:59:59 เพื่อให้รวมวันที่สุดท้ายได้

                                        return orderDate >= startDate && orderDate <= endDate;
                                    });
                                })
                                .sort((a, b) => b.localeCompare(a, undefined, { numeric: true })) // เรียงจากมากไปน้อย

                                // วนลูปการดึงข้อมูล order จาก BillID เดียวกัน
                                .map((billID) => {
                                    // ฟังก์ชันคำนวณราคารวมของ order ใน BillID เดียวกัน
                                    const totalPrice = groupedOrders[billID].reduce((acc, order) => acc + parseFloat(order.Price), 0);

                                    // สมมติว่า slip ของแต่ละ order เหมือนกัน ให้แสดงแค่ slip อันเดียวต่อ BillID
                                    const slipImage = groupedOrders[billID][0]?.SlipImage;

                                    // ดึงข้อมูลของ order ที่มี BillID เดียวกันมาแสดง
                                    const order = groupedOrders[billID][0];

                                    return (
                                        <Grid2 key={billID} sx={{ border: '2px solid green', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <Box>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', fontSize: '18px' }}>
                                                        {/* ดึงข้อมูล billID มาแสดง */}
                                                        Order ID: {billID}
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                        <AccountCircleIcon sx={{ color: 'skyblue', marginRight: '8px' }} />
                                                        {/* ดึงข้อมูล cname ของ order มาแสดง */}
                                                        Customer name : {order.cname} 
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
                                                        <span style={{ color: 'green' }}>
                                                            {/* ดึงข้อมูล status ของ order มาแสดง */}
                                                            {statusMap[order.BillID]}
                                                        </span>
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                        {/* ดึงข้อมูล DeliveryTime ของ order มาแสดง */}
                                                        Delivery Time: {order.DeliveryTime ? new Date(order.DeliveryTime).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : 'ยังไม่มีข้อมูล'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* ฟังก์ชันนี้เป็นการดึงข้อมูลแบบ loop ถ้า order นี้มี 2 สินค้า ก็จะ loop 2 ครั้ง โดยจะดึงจาก BillID เดียวกัน */}
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
                                                <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                    รีวิว : &nbsp;
                                                    <span style={{ color: 'green', fontWeight: '700' }}>
                                                        {/* ราคารวมของ order ทุก order ที่มี BillID เดียวกัน */}
                                                        {groupedOrders[billID][0]?.review || 'ยังไม่มีรีวิว'}
                                                    </span>
                                                </Typography>
                                                <Typography sx={{ marginLeft: 'auto', fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                    ราคารวมทั้งหมด:
                                                    <span style={{ color: 'green', fontWeight: '700' }}>
                                                        {/* ราคารวมของ order ทุก order ที่มี BillID เดียวกัน */}
                                                        {totalPrice.toFixed(2)}
                                                    </span>
                                                    บาท
                                                </Typography>
                                            </Box>

                                            {/* แสดง slip อันเดียวต่อ BillID */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
                                                <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>หลักฐานการโอน</Typography>
                                                <Button
                                                    // เมื่อคลิ๊กปุ่มนี้ ฟังก์ชั่น handleImageClick จะทำงาน ก็คือ ฟังก์ชั่น ดึงข้อมูล slip มาแสดง
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


                {/* หน้านี้เหมือนกับอัน เสร็จสิ้น แค่ เปลี่ยนฟิลเตอร์จาก เสร็จสิ้น เป็น ยกเลิก */}
                <CustomTabPanel value={value} index={2}>
                    <Box sx={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <Grid2 container spacing={2} sx={{ mt: '24px', display: 'flex', flexDirection: 'column' }}>
                            {Object.keys(groupedOrders)
                                .sort((a, b) => b.localeCompare(a, undefined, { numeric: true })) // เรียงจากมากไปน้อย
                                .filter(billID => groupedOrders[billID].some(order => order.Status === 'ยกเลิก'))
                                .map((billID) => {
                                    // ฟังก์ชันคำนวณราคารวมของ order ใน BillID เดียวกัน
                                    const totalPrice = groupedOrders[billID].reduce((acc, order) => acc + parseFloat(order.Price), 0);

                                    // สมมติว่า slip ของแต่ละ order เหมือนกัน ให้แสดงแค่ slip อันเดียวต่อ BillID
                                    const slipImage = groupedOrders[billID][0]?.SlipImage;

                                    // ใช้ข้อมูลของ order แรกใน BillID เพื่อแสดงข้างๆ Order ID
                                    const order = groupedOrders[billID][0];
                                    return (
                                        <Grid2 item key={billID} sx={{ border: '2px solid red', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <Box>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', fontSize: '18px' }}>
                                                        Order ID: {billID}
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                        <AccountCircleIcon sx={{ color: 'skyblue', marginRight: '8px' }} />
                                                        {/* ดึงข้อมูล cname ของ order มาแสดง */}
                                                        Customer name : {order.cname} 
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                        <LocationOnIcon sx={{ color: 'red', marginRight: '8px' }} />
                                                        Address : {order.UserAddress}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                        Status:
                                                        <span style={{ color: 'red' }}>
                                                            {statusMap[order.BillID]}
                                                        </span>
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>
                                                        Delivery Time: {order.DeliveryTime ? new Date(order.DeliveryTime).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : 'ยังไม่มีข้อมูล'}
                                                    </Typography>

                                                </Box>
                                            </Box>

                                            {/* Loop to display order details for the specific BillID */}
                                            {groupedOrders[billID].map((order, index) => (
                                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                                    <Box>
                                                        {/* <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>Product ID: {order.PID}</Typography> */}
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>รายการ : &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {order.menu}
                                                            </span>
                                                        </Typography>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>รูปแบบการทำอาหาร : &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
                                                                {order.Service}
                                                            </span>
                                                        </Typography>

                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>ราคา: &nbsp;

                                                            <span style={{ color: '#7E481E' }}>
                                                                {order.Price}
                                                            </span>
                                                            &nbsp; บาท</Typography>
                                                        <Typography sx={{ fontFamily: 'IBM Plex Sans Thai', fontWeight: '600' }}>น้ำหนัก: &nbsp;
                                                            <span style={{ color: '#7E481E' }}>
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
                <CustomTabPanel value={value} index={3}>
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
                                            {/* ปุ่มแก้ไขและลบบริการ */}
                                            <Button onClick={() => handleEditService(service.id, service)}>Edit</Button>
                                            <Button onClick={() => handleDeleteService(service.id)}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CustomTabPanel>

            </Box>
            {/* Modal สำหรับแสดงรูป Slip */}
            <Modal
                // open เมื่อ ตัวแปร open เป็น true ก็คือตอนกดปุ่ม Slip ที่แสดงอยู่ใน Box ของ order แต่ละอัน
                open={open}
                // close เมื่อกดปิด หรือ กดที่ไหนก็ได้ที่อยู่นอก Modal นี้
                onClose={handleClose}
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
                        height: '700px',
                        width: '500px',
                        bgcolor: 'background.paper',
                        padding: 2,
                    }}
                >
                    {/* รูป ดึงมาจากตัวแปร selectedImage จะแสดงรูป Slip ของ BillID ที่กดเปิด slip มา */}
                    <img
                        src={selectedImage}
                        alt="Large Slip"
                        style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px' }}
                    />
                </Box>
            </Modal>

            {/* Modal สำหรับเพิ่มบริการ */}
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
                        label="ชื่อบริการ"
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
        </>
    );
}

export default Admin;
