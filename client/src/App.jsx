import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice.js'
import InterviewPage from './pages/InterviewPage.jsx'
import InterviewHistory from './pages/InterviewHistory.jsx'
import Pricing from './pages/Pricing.jsx'
import InterviewReport from './pages/InterviewReport.jsx'

export const ServerUrl = "https://ai-mock-interview-platform-s043.onrender.com"

function App() {
  const dispatch = useDispatch()
  useEffect(() => {
    const getUser = async () =>{
      try {
        const result = await axios.get(ServerUrl + '/api/user/current-user' , {withCredentials:true})
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }
    getUser();
  },[dispatch])
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/interview' element={<InterviewPage/>}/>
        <Route path='/history' element={<InterviewHistory/>}/>
        <Route path='/pricing' element={<Pricing/>}/>
        <Route path='/report/:id' element={<InterviewReport/>}/>
      </Routes>
    </div>
  )
}

export default App
