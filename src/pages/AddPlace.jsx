import { useNavigate } from 'react-router'
import PlaceForm from '../components/Place/PlaceForm'

export default function AddPlace() {
	const navigate = useNavigate()

	return <PlaceForm onSuccess={() => navigate('/profile', { state: { added: true } })} />
}
