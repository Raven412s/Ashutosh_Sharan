import React from 'react'
import { Navbar } from '../layout/Navbar'
// import { Footer } from '../layout/footer'

const NavAndFooterProvider = ({children}: {children: React.ReactNode}) => {
  return (
    <>
    <Navbar/>
    {children}
    {/* <Footer/> */}
    </>
  )
}

export default NavAndFooterProvider