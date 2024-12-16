import DonateForm from "@/Components/DonateForm";
// import { useRouter } from "next/navigation";

export default function Page({ params }) {

    // const [paymentURL, setPaymentURL] = useState('/')
    // const router = useRouter()
    // return router.push(paymentURL)
    
    return <DonateForm {...params} payingOptions={[
        { title: "A General Donation" },
        { title: "Festival Seva" },
        { title: "Food For Life" },
        { title: "Janmashtami" },
        { title: "Sponsor Sankirtan" },
        { title: "Sponsor Gita" },
        { title: "Offer A Puja" },
        { title: "Deity Worship Seva" },
        { title: "Janmastami" },
        { title: "Srila Prabhupada's Appearance Day" },
        { title: "Radha Ashtami" },
        { title: "Jhulan Yatra" },
        { title: "Govardhan Puja" },
        { title: "Gita Jayanti" },
        { title: "Sharad Purnima" },
        { title: "Kartik - The Holiest Month" },
        { title: "Nityananda Trayodasi" },
        { title: "Gaura Purnima" },
        { title: "Narsimha Chaturdasi" },
        { title: "Ram Navami" },
        { title: "Akshay Tritiya" },
        { title: "Balarama Jayanti" },
        { title: "Snana Yatra" },
        { title: "Ratha Yatra" },
        { title: "ISKCON Warangal's Anniversary" },
        { title: "Food For Life" },
        { title: "FLOWER SEVA" },
        { title: "DEITY DRESS SEVA" },
        { title: "DEITY WORSHIP SEVA" },
        { title: "Special Occasion" },
        { title: "Feed 50 People" },
        { title: "Feed 100 People" },
        { title: "Feed 200 People" },
        { title: "Feed 500 People" },
        { title: "Feed 1000 People" },
        { title: "General Donation Amount of your Choice" },
        { title: "Fund-raising for Community Kitchen" },
        { title: "Life Membership" }
    ]} />
}