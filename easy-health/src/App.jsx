import React from 'react';
import {Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import MyAppointments from './pages/MyAppointments';
import Appointment from './pages/Appointment';
import Doctors from './pages/Doctors';
import Contact from './pages/Contact';
import Login from './pages/Login';
import About from './pages/About';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/doctors' element={<Doctors/>}/>
        <Route path='/doctors/:speciality' element={<Doctors/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/myAppointments' element={<MyAppointments/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/appointment/:docId' element={<Appointment/>}/>
      </Routes>
    </div>
  );
}

export default App;
