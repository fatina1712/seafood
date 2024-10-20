import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Divider, FormControl, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = ({ setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    // เมื่อกดปุ่ม login
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/login', { username, password });
            setUser(response.data.user);
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            // เช็คว่า username เป็น admin หรือไม่
            if (response.data.user.username === 'admin') {
                navigate('/editproduct'); // ถ้าเป็น admin ให้ไปหน้า /editproduct
            } else {
                navigate('/home'); // ถ้าไม่ใช่ admin ให้ไปหน้า /home
            }
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
        }
    };


    const handleRegister = () => {
        navigate('/register'); // เมื่อกด register จะพาไปหน้า /register
    };

    return (
        <>
            <Box
                sx={{
                    width: '100%',
                    height: '100vh',
                    backgroundImage: 'url(/wallpaper.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <Box
                    sx={{
                        width: '50%',
                        height: '100%',
                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                        marginLeft: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '80%',
                            flexDirection: 'column'
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '48px',
                                fontWeight: '700',
                                color: '#938667',
                                fontFamily: 'IBM Plex Sans Thai',
                            }}
                        >
                            Login
                        </Typography>

                        {/* textfield ของ username */}
                        <TextField
                            placeholder='Username'
                            // กำหนดให้ข้อมูลที่กรอกเป็นค่าของ username
                            value={username}
                            // เมื่อกดปุ่ม login ด้านล่างแล้ว ข้อมูลจะบันทึกไปในค่า setUsername
                            onChange={(e) => setUsername(e.target.value)}
                            InputProps={{
                                style: {
                                    border: '1px solid #878787',
                                    borderRadius: '50px'
                                }
                            }}
                            sx={{
                                width: '100%',
                                mt: '12px',
                                borderRadius: '50px',
                                bgcolor: 'white'
                            }}
                        />

                        {/* textfield ของ password */}
                        <TextField
                            placeholder='Password'
                            variant="outlined"
                            type={showPassword ? 'text' : 'password'}
                            // กำหนดให้ค่าที่กรอกเป็นค่าของ password
                            value={password}
                            // เมื่อกดปุ่ม login ด้านล่างแล้ว ข้อมูลจะบันทึกไปในค่า setPassword
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                style: {
                                    border: '1px solid #878787',
                                    borderRadius: '50px'
                                },
                                // อันนี้เป็นฟังก์ชั่น โชว์ password เมื่อกดแล้วจะสลับ ซ๋อน หรือ โชว์ password ในช่องของ password
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                width: '100%',
                                marginTop: '12px',
                                borderRadius: '50px',
                                bgcolor: 'white'
                            }}
                        />

                        {/* ปุ่ม login */}
                        <Button
                            // เมื่อกดปุ่ม Login ฟังก์ชั่น handleSubmit จะทำงาน
                            onClick={handleSubmit}
                            sx={{
                                borderRadius: '50px',
                                bgcolor: '#938667',
                                border: '1px solid #D9D9D9',
                                color: 'white',
                                width: '60%',
                                marginTop: '24px',
                                height: '57px',
                                // hover คือ ถ้าชี้แล้ว bgcolor(สีพื้นหลัง) จะเปลี่ยนไป
                                '&:hover': {
                                    bgcolor: '#7A7053'
                                }
                            }}
                        >
                            Login
                        </Button>

                        {/* เส้นขีด */}
                        <Divider
                            sx={{
                                width: '50%',
                                marginTop: '24px'
                            }}
                        />

                        <Typography
                            sx={{
                                color: '#524B38',
                                fontSize: '14px',
                                marginTop: '12px'
                            }}
                        >
                            Don't have an account ?
                        </Typography>

                        {/* ปุ่ม Register */}
                        <Button
                            // เมื่อคลิก ฟังก์ชั่น handleRegister จะทำงาน
                            onClick={handleRegister}
                            sx={{
                                borderRadius: '50px',
                                bgcolor: 'white',
                                border: '1px solid #D9D9D9',
                                color: '#938667',
                                width: '60%',
                                marginTop: '24px',
                                height: '57px',
                                '&:hover': {
                                    bgcolor: '#F0F0F0'
                                }
                            }}
                        >
                            Register
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default Login;
