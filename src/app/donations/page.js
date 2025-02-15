"use client"
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios'
import { CSVLink } from "react-csv";

function Donations() {

    const columns = [
        {
            name: 'Order ID',
            selector: row => <div className="text-wrap text-left">{row?.webhookData?.orderId || row?.orderId}</div>,
            width: "120px"
        },
        {
            name: 'Status',
            selector: row => <div className="text-wrap text-left">{row?.webhookData?.txStatus || row?.status}</div>,
            cell: (props) => {
                return props?.webhookData?.txStatus === "SUCCESS" ?
                    <span style={{ fontWeight: 800, color: "green" }}>SUCCESS</span>
                    :
                    <span style={{ fontWeight: 800, color: "red" }}>PENDING</span>
            },
            width: "120px"
        },
        {
            name: 'Name',
            selector: row => <div className="text-wrap text-left">{row?.name}</div>,
            width: "200px"
        },
        {
            name: 'Donation For',
            selector: row => <div className="text-wrap text-left">{row?.donatedFor || '-'}</div>,
            width: "200px"
        },
        {
            name: 'Amount',
            selector: row => <div className="text-wrap text-left">{row?.webhookData?.orderAmount || row?.amount}</div>,
            width: "150px"
        },
        {
            name: 'Source',
            selector: row => <div className="text-wrap text-left">{row?.redirectedFrom || 'Other'}</div>,
            width: "150px"
        },
        {
            name: 'Email',
            selector: row => <div className="text-wrap text-left">{row?.email}</div>,
            width: "300px"
        },
        {
            name: 'Phone',
            selector: row => <div className="text-wrap text-left">{row?.phone}</div>,
            width: "120px"
        },
        {
            name: 'Address',
            selector: row => <div className="text-wrap text-left">{row?.address}</div>,
            width: "200px"
        },
        {
            name: 'Pin',
            selector: row => <div className="text-wrap text-left">{row?.pin}</div>,
            width: "100px"
        },
        {
            name: 'Pan',
            selector: row => <div className="text-wrap text-left">{row?.pan}</div>,
            width: "100px"
        },
        {
            name: 'Memory Of Someone',
            selector: row => <div className="text-wrap text-left">{row?.memoryOfSomeoneName}</div>,
            width: "200px"
        },
        {
            name: 'Payment Mode',
            selector: row => <div className="text-wrap text-left">{row?.webhookData?.paymentMode || "-"}</div>,
            width: "100px"
        },
        {
            name: 'Created At',
            selector: row => <div className="text-wrap text-left">{row?.createdAt}</div>,
            sortable: true,
            width: "200px"
        },
        {
            name: 'Message Sent',
            selector: row => <div className="text-wrap text-left">{row?.messageSent ? "true" : "false"}</div>,
            sortable: true,
            width: "150px"
        }
    ];

    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [flattenData, setflattenData] = useState([])

    const flatData = (arr) => {
        if (arr.length === 0) return
        const d = arr.map(item => ({
            "orderId": item?.webhookData?.orderId || item?.orderId,
            "name": item?.name,
            "donatedFor": typeof item?.donatedFor === 'string' ? (item?.donatedFor || '-'): JSON.parse(item?.donatedFor)?.title,
            "amount": item?.webhookData?.orderAmount || item?.amount,
            "source": item?.redirectedFrom || 'Other',
            "email": item?.email,
            "phone": item?.phone,
            "address": item?.address,
            "pin": item?.pin,
            "pan": item?.pan,
            "memoryOfSomeoneName": item?.memoryOfSomeoneName,
            "status": item?.webhookData?.txStatus || item?.status,
            "paymentMode": item?.webhookData?.paymentMode || '-',
            "createdAt": item?.createdAt,
            "MessageSendStatus": item?.messageSent?.toString() || '-'
        }))
        setflattenData(d)
    };

    const fetchData = async (password) => {
        try {
            const response = await axios.post("/api/fetchAllOrders", { password })
            if (response.status === 200) {
                setIsLoading(true)
                setData(response.data?.data)
                flatData(response.data?.data)
            } else if (response.status === 300) {
                alert("Wrong Password")
                // getPassword()
            } else throw response.data?.data
        } catch (error) {
            alert(error.response.data?.data)
            // getPassword()
        }
    }

    // const getPassword = () => {
    //     let password = prompt("Enter Admin Password: ") || null
    //     while (!password) {
    //         password = prompt("Enter Admin Password: ")
    //         if (!password || password === '')
    //             alert("Invalid Password, try again...")
    //     }
    //     fetchData(password)
    // }

    useEffect(() => {

        // getPassword()
        fetchData('Hari')

    }, [])

    return (
        isLoading ?
            <div className='container'>

                <h1 className='text-center' style={{ marginBottom: "3%", marginTop: "3%" }}>
                    Donations
                    {
                        data.length > 0
                            ?
                            <CSVLink
                                data={flattenData}
                            >
                                <h4>(Download CSV)</h4>
                            </CSVLink>
                            : ""
                    }
                </h1>

                <DataTable
                    columns={columns}
                    data={data}
                    pagination
                    customStyles={{
                        headCells: {
                            style: {
                                fontWeight: 800,
                            },
                        }
                    }}
                />

            </div>
            :
            <div className='container'>
                <h4>Processing...</h4>
            </div>
    );
};

export default Donations

/**
 {
            "_id": "663b30f4d04d46081cc82941",
            "orderId": "order_195476",
            "name": "Prince",
            "email": "thedesiretree47@gmail.com",
            "phone": "7001617004",
            "address": "B 3/1, Imagine Residency\nNear Eyelex Cinemas",
            "pin": "831012",
            "amount": "1.00",
            "pan": "",
            "memoryOfSomeoneName": "Hari Hari",
            "status": "SUCCESS",
            "signature": "Bo8lu+h2DtL1mdcvR9xuVLDJ4F5Lh8arLnb0sYoJumM=",
            "createdAt": "2024-05-08T07:59:46.751Z",
            "__v": 0,
            "webhookData": {
                "orderId": "order_195476",
                "orderAmount": "1.00",
                "referenceId": "2714945733",
                "txStatus": "SUCCESS",
                "paymentMode": "UPI",
                "txMsg": "00%3A%3ATransaction+is+Successful",
                "txTime": "2024-05-08+13%3A30%3A24",
                "signature": "osQUBrjJrikICHNAHWEKPo0oxlA%2FVgN6cUWz4LqYk4A%3D"
            }
 */