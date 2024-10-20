import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [cname, setCname] = useState('');
    const [clastname, setClastname] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    // ตรวจสอบ email ให้อยู่ในรูปแบบของ email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // เมื่อกด register จะตรวจสอบว่า กรอกครบทุกช่องมั้ยถ้ายังไม่ครบ จะขึ้น alert ข้างล่าง
        if (!username || !password || !email || !cname || !clastname || !phone || !address) {
            alert('กรุณากรอกให้ครบทุกช่อง');
            return;
        }

        // ตรวจสอบว่ารูปแบบของ email ที่กรอกมาถูกต้องมั้ย
        if (!validateEmail(email)) {
            alert('กรุณากรอกอีเมลให้ถูกต้อง');
            setIsEmailValid(false);
            return;
        }

        setIsEmailValid(true);
        try {
            // ถ้าทุกอย่างถูกต้อง จะแสดง alert ว่า Registration successful 
            await axios.post('http://localhost:3000/api/register', { username, password, email, cname, clastname, phone, address });
            alert('Registration successful');
            navigate('/login');
        } catch (error) {
            // ถ้าติด error หรือ อะไรสักอย่าง จะขึ้น alert บอกว่า error ตรงไหน
            console.error('Registration error:', error);
            alert('Registration failed: ' + (error.response?.data?.message || error.message));
        }
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
                    <FormControl
                        onSubmit={handleSubmit}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '80%'
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
                            Register
                        </Typography>

                        {/* textfield ของ firstname */}
                        <TextField
                            placeholder='First Name'
                            variant="outlined"
                            // กำหนดให้ข้อมูลที่กรอกเป็นค่า cname
                            value={cname}
                            // เมื่อกดปุ่ม register ด้านล่างแล้ว ข้อมูลจะบันทึกไปในค่า setCname
                            onChange={(e) => setCname(e.target.value)}
                            // กำหนดสี placeholder
                            InputLabelProps={{
                                style: { color: '#878787' }
                            }}
                            // กำหนด border และ borderradius ของ textfield
                            InputProps={{
                                style: {
                                    border: '1px solid #878787',
                                    borderRadius: '50px'
                                }
                            }}
                            // กำหนดความกว้าง , margintop , สี ของ textfield
                            sx={{
                                width: '100%',
                                mt: '12px',
                                borderRadius: '50px',
                                bgcolor: 'white'
                            }}
                        />

                        {/* textfield ของ lastname */}
                        <TextField
                            placeholder='Last Name'
                            variant="outlined"
                            // กำหนดให้ข้อมูลที่กรอกเป็นค่า clastname
                            value={clastname}
                            // เมื่อกดปุ่ม register ด้านล่างแล้ว ข้อมูลจะบันทึกไปในค่า setClastname
                            onChange={(e) => setClastname(e.target.value)}
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
                                width: '100%',
                                mt: '12px',
                                borderRadius: '50px',
                                bgcolor: 'white'
                            }}
                        />

                        {/* textfield ของ phone */}
                        <TextField
                            placeholder='Phone'
                            variant="outlined"
                            // กำหนดให้ค่าที่กรอกเป็นค่า phone
                            value={phone}
                            // เมื่อกดปุ่ม register ด้านล่างแล้ว ข้อมูลจะบันทึกไปในค่า setPhone
                            onChange={(e) => setPhone(e.target.value)}
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
                                width: '100%',
                                mt: '12px',
                                borderRadius: '50px',
                                bgcolor: 'white'
                            }}
                        />

                        {/* textfield ของ ที่อยู่ */}
                        <TextField
                            placeholder='Address'
                            variant="outlined"
                            // กำหนดให้ค่าทีกรอกเป็น address
                            value={address}
                            // เมื่อกดปุ่ม register ด้านล่างแล้ว ข้อมูลจะบันทึกไปในค่า setAddress
                            onChange={(e) => setAddress(e.target.value)}
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
                                width: '100%',
                                mt: '12px',
                                borderRadius: '50px',
                                bgcolor: 'white'
                            }}
                        />

                        {/* textfield ของ username */}
                        <TextField
                            placeholder='Username'
                            variant="outlined"
                            // กำหนดให้ค่าที่กรอกเป็น username
                            value={username}
                            // เมื่อกดปุ่ม register ด้านล่างแล้ว ข้อมูลจะบันทึกไปในค่า setUsername
                            onChange={(e) => setUsername(e.target.value)}
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
                            // กำหนดให้ค่าที่กรอกเป็น password
                            value={password}
                            // เมื่อกดปุ่ม register ด้านล่างแล้ว ข้อมูลจะบันทึกไปในค่า setPassword
                            onChange={(e) => setPassword(e.target.value)}
                            InputLabelProps={{
                                style: { color: '#878787' }
                            }}
                            InputProps={{
                                style: {
                                    border: '1px solid #878787',
                                    borderRadius: '50px'
                                },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {/* ปุ่มกดแสดง หรือ ปิด password ของเรา จะ set ไว้ให้ปิดก่อน ถ้ากดอีกครั้งจะเปิด แล้วสามารถดู password ที่พิมพ์ไปได้ */}
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
                                mt: '12px',
                                borderRadius: '50px',
                                bgcolor: 'white'
                            }}
                        />

                        {/* textfield ของ email */}
                        <TextField
                            placeholder='Email'
                            variant="outlined"
                            // กำหนดให้ค่าที่กรอกเป็น email
                            value={email}
                            // เมื่อกดปุ่ม register ด้านล่างแล้ว ข้อมูลจะบันทึกไปในค่า setEmail
                            onChange={(e) => setEmail(e.target.value)}
                            InputLabelProps={{
                                style: { color: '#878787' }
                            }}
                            InputProps={{
                                style: {
                                    // ถ้ากรอก email ไม่ถูก (ไม่มี @xxx.com จะเปลี่ยน  border เป็นสีแดง)
                                    border: `1px solid ${isEmailValid ? '#878787' : 'red'}`,
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

                        {/* ปุ่ม register เมื่อกดจะเรียกใช้ฟังก์ชั่น handleSubmit */}
                        <Button
                            onClick={handleSubmit}
                            sx={{
                                borderRadius: '50px',
                                bgcolor: '#938667',
                                border: '1px solid #D9D9D9',
                                color: 'white',
                                width: '60%',
                                marginTop: '24px',
                                height: '57px',
                                '&:hover': {
                                    bgcolor: '#7A7053'
                                }
                            }}
                        >
                            Register
                        </Button>
                    </FormControl>
                </Box>
            </Box>
        </>
    );
};

export default Register;
