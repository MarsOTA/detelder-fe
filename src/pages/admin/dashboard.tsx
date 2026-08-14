import { useEffect } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";


export default function Dashboard() {

  useEffect(() => {

    fethcUser();

  }, [])


  const fethcUser = async () => {

    console.log('token: ' + localStorage.getItem('token'));
    
    const resp = await fetch(ezystaffBEUrl + 'operatori', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      credentials: 'include',
    })

    const data = await resp.json();

    console.log(data);

  }

  return (
    <>
      <div>
        <h1>Dashboard Amministratore</h1>
      </div>
    </>
  )

}