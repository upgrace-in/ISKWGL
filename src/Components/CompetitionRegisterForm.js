'use client'
import { useEffect, useState } from "react"
import axios from 'axios'
import HandlePayment from "@/Helpers/HandlePayment"
import Image from "next/image"
import Slideshow from "@/Components/Slideshow"
import GetSearchParams from '@/Components/GetSearchParams'

export default function CompetitionRegisterForm(props) {
    const value = GetSearchParams()
    const [redirectedFrom, setRedirectedFrom] = useState(props?.defaultReferral)
    useEffect(() => {
        if (value) setRedirectedFrom(value)
    }, [value])

    const [data, setData] = useState()
    const [amount, setAmount] = useState(props.payingOptions?.[0]?.amount || 0)
    const [event, setEvent] = useState(props.payingOptions?.[0])
    const [status, setStatus] = useState({})
    const [fields, setFields] = useState(null)

    useEffect(() => {
        if (event) setAmount(event.amount)
    }, [event])

    const checkPropertyAndData = async (dict, propertyName) => {
        if (!dict.hasOwnProperty(propertyName) || dict[propertyName] === "" || dict[propertyName] === 0)
            throw { error: `Kindly fill ${propertyName}...` }
        if (propertyName === 'dob') {
            const selectedDate = new Date(dict[propertyName])
            const currentDate = new Date()
            if (selectedDate > currentDate)
                throw { error: "Invalid DOB!" }
        }

        if (propertyName === 'gender' && (dict[propertyName] === "" || dict[propertyName] === "select")) {
            throw { error: "Kindly select gender..." };
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        let finalData = {}
        const formData = new FormData(e.target)
        formData.forEach((value, property) => finalData[property] = value)
        finalData['eventName'] = event.title

        try {
            let validateThem = props?.fields
            for (var i = 0; i < validateThem.length; i++) {
                await checkPropertyAndData(finalData, validateThem[i]).catch(e => { throw e })
            }
            if (!parseFloat(finalData['amount']) > 0) throw { error: "Invalid Amount !!!" }

            setStatus({ message: "Processing Registration...", disabled: true })
            const response = await axios.post(`/api/createDonation/`, { ...finalData, donationType: event.title, redirectedFrom: (redirectedFrom || '') })
            if (response?.status !== 200) throw { error: "Unable to save data, please try again later !!!" }
            setData(response.data)
            setStatus({})
        } catch (e) {
            setStatus({ ...e, default: false })
        }
    }

    return (
        <section className="donation-form-sec">
            <HandlePayment data={data} />
            <div className="container">
                <div className="row d-flex justify-content-center mb-5">
                    <div className="col-md-10">
                        <div id="scrollToDonationForm" className="heading">
                            <h2 className="head-1">{props?.heading || "Competition Registration"}</h2>
                            <p className="b-line">{props?.description || "Register for the event below."}</p>
                        </div>
                    </div>
                </div>
                <div className="form-wrap my-5 fw-form">
                    <form id="competitionRegisterForm" onSubmit={handleSubmit}>
                        <div className="row align-items-start">
                            <div className="col-lg-4 pe-xl-4">
                                <div className="donate-img">
                                    <figure className="up-right">
                                        {Array.isArray(event?.imagePath) && event.imagePath.length > 1 ? (
                                            <Slideshow images={event.imagePath} />
                                        ) : (
                                            <Image
                                                width={300}
                                                height={300}
                                                src={Array.isArray(event?.imagePath) ? event.imagePath[0] : event?.imagePath}
                                                alt={event?.title}
                                            />
                                        )}
                                    </figure>
                                </div>
                                <div className="form-part mt-4 me-lg-2">
                                    <div className="notes-wrap mt-0">
                                        <p className="text-center"><span> Please Note:</span> Complete Address with PIN-Code is mandatory for registration.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-8 mt-lg-0 mt-4 ">
                                <div className="row">
                                    {props.fields?.includes('eventName') && (
                                        <div className="col-md-6">
                                            <div className="form-part">
                                                <label htmlFor="eventName">Event Name</label>
                                                <select
                                                    name="eventName"
                                                    onChange={e => setEvent(JSON.parse(e.target.value))}
                                                >
                                                    {props.payingOptions?.map((d, i) =>
                                                        event?.title === d.title
                                                            ? <option selected value={JSON.stringify(d)} key={i}>{d.title}</option>
                                                            : <option value={JSON.stringify(d)} key={i}>{d.title}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {props.fields?.map(field => {
                                        if (field === 'eventName') return null;
                                        switch (field) {
                                            case 'amount':
                                                return (
                                                    <div className="col-md-6" key="amount">
                                                        <div className="form-part">
                                                            <label htmlFor="amount">Amount*</label>
                                                            <input
                                                                type="text"
                                                                name="amount"
                                                                value={amount}
                                                                onChange={e => setAmount(e.target.value)}
                                                                placeholder="Enter Amount"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            case 'name':
                                                return (
                                                    <div className="col-md-6" key="name">
                                                        <div className="form-part">
                                                            <label htmlFor="name">Name*</label>
                                                            <input maxLength="50" type="text" name="name" placeholder="Name" />
                                                        </div>
                                                    </div>
                                                );
                                            case 'gender':
                                                return (
                                                    <div className="col-md-6" key="gender">
                                                        <div className="form-part">
                                                            <label htmlFor="gender">Gender*</label>
                                                            <select name="gender" defaultValue="">
                                                                <option value="" disabled>Select Gender</option>
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                );
                                            case 'phone':
                                                return (
                                                    <div className="col-md-6" key="phone">
                                                        <div className="form-part">
                                                            <label htmlFor="phone">Mobile Number*</label>
                                                            <input type="tel" placeholder="Phone Number" maxLength="10" name="phone" />
                                                        </div>
                                                    </div>
                                                );
                                            case 'email':
                                                return (
                                                    <div className="col-md-6" key="email">
                                                        <div className="form-part">
                                                            <label htmlFor="email">Email*</label>
                                                            <input type="text" name="email" placeholder="Email" />
                                                        </div>
                                                    </div>
                                                );
                                            case 'dob':
                                                return (
                                                    <div className="col-md-6" key="dob">
                                                        <div className="form-part">
                                                            <label htmlFor="dob">DOB*</label>
                                                            <input type="date" name="dob" />
                                                        </div>
                                                    </div>
                                                );
                                            case 'pin':
                                                return (
                                                    <div className="col-md-6" key="pin">
                                                        <div className="form-part">
                                                            <label htmlFor="pin">PIN Code*</label>
                                                            <input type="text" minLength="6" maxLength="6" name="pin" placeholder="PIN Code" />
                                                        </div>
                                                    </div>
                                                );
                                            case 'address':
                                                return (
                                                    <div className="col-md-12" key="address">
                                                        <div className="form-part">
                                                            <label htmlFor="address">Address*</label>
                                                            <textarea type="text" name="address" placeholder="Address" />
                                                        </div>
                                                    </div>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                    {status?.message &&
                                        <span className="mt-2" style={{ color: 'red' }}>
                                            {status?.message}
                                        </span>
                                    }
                                    {status?.success &&
                                        <span className="mt-2" style={{ color: 'green' }}>
                                            <b>{status?.success}</b>
                                        </span>
                                    }
                                    {status?.error &&
                                        <span className="mt-2" style={{ color: 'red' }}>
                                            {status?.error}
                                        </span>
                                    }
                                    <div className="col-12 mt-2">
                                        <button type="submit" disabled={status?.disabled}
                                            className="box-hover custom-btn-cls donation_btn ms-0 donate-now-clicked-form">
                                            {props?.submitButtonText || "REGISTER"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="donate-note my-5">
                    <p>Note: Registration is mandatory for participation in Janmashtami competitions.</p>
                </div>
            </div>
        </section>
    )
}
