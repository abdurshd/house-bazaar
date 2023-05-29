import {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {collection, getDocs, query, where, orderBy, limit, startAfter} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'
import Spinner from './Spinner'

const Category = () => {
    const [listinglar, setListinglar] = useState(null)
    const [loading, setLoading] = useState(true)

    const params = useParams()

    useEffect(() => {
        const fetchListing = async () => {
            try {
                //get reference
                const listingsRef = collection(db, 'listinglar')

                //create a query
                const q = query(
                    listingsRef,
                    where('type', '==', params.categoryName),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                )

                //execute query
                const querySnap = await getDocs(q)

                let listinglar = []

                querySnap.forEach((doc) => {
                    return listinglar.push({
                        id: doc.id,
                        data: doc.data()
                    })
                })
                setListinglar(listinglar)
                setLoading(false)
            } catch (error) {
                toast.error('Could not fetch listinglar')
            }
        }
        fetchListing()
    }, [params.categoryName])

  return (
    <div className="category">
        <header>
            <p className="pageHeader">
                {params.categoryName === 'rent' ? 'Places for rent' : 'Places for sale'}
            </p>
        </header>
        {loading ? (<Spinner/> ): listinglar && listinglar.length > 0 ? 
        (<>
        <main>
            <ul className="categoryListings">
                {listinglar.map((listing) => (
                    <h3>{listing.data.name}</h3>
                ))}
            </ul>
        </main>
        </>) : (<p> No listinglar for {params.categoryName}</p>)}
      
    </div>
  )
}

export default Category
