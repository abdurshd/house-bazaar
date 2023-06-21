import {useState, useEffect} from 'react'
import {useParams, useSearchParams} from 'react-router-dom'
import {doc, getDoc} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'

const Contact = () => {
    const [message, setMessage] = useState('')
    const [landlord, setLandlord] = useState(null)
    const [searchParams, setSearchParams] = useSearchParams()
    
    const params = useParams()

    useEffect (() => {
        const getLandlord = async () => {
            const docRef = doc(db, 'users', params.landlordId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                setLandlord(docSnap.data())
            } else {
                toast.error('Landlord not found')
            }
        }
        getLandlord()

    }, [params.landlordId])

    const onChange = (e) => setMessage(e.target.value)

  return (
    <div className='pageContainer'>
        <header>
            <p className="pageHeader">Contact landlord</p>
        </header>

        {landlord !== null && (
            <main>
                <div className="contactLandlord">
                    <p className="landlordName"> Contact {landlord?.name}</p>
                </div>
                <form className="messageForm">
                    <div className="messageDiv">
                        <label htmlFor="message" className="messageLAbel">
                            Message
                        </label>
                        <textarea name="message" id="message"  className='textarea' value={message} onChange={onChange}></textarea>
                    </div>
                    <a href={`mailto:${landlord?.email}?Subject=${searchParams.get('listing Name')}&body=${message}`}>
                        <button type='button' className='primaryButton'>
                            Send
                        </button>
                        </a>
                </form>
            </main>
)}
    </div>
  )
}

export default Contact
