import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import { Link } from 'react-router'
import styles from '../../css/MapView.module.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
	iconUrl,
	shadowUrl: iconShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const CENTER = [53.9385, 27.6685] // Октябрьский район Минска

// Компонент для обработки клика по карте (только если передан onMapClick)
function ClickHandler({ onMapClick }) {
	useMapEvents({
		click(e) {
			if (onMapClick) onMapClick(e.latlng)
		},
	})
	return null
}

export default function MapView({ places = [], onMapClick, pickedPoint }) {
	return (
		<div className={styles.wrapper}>
			<MapContainer center={CENTER} zoom={14} className={styles.map}>
				<TileLayer
					attribution='&copy; OpenStreetMap contributors'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>
				<ClickHandler onMapClick={onMapClick} />

				{places.map(place => (
					<Marker key={place.id} position={[place.lat, place.lng]}>
						<Popup>
							<strong>{place.title}</strong>
							<br />
							<span className={styles.category}>{place.category}</span>
							<br />
							<Link to={`/place/${place.id}`}>Подробнее →</Link>
						</Popup>
					</Marker>
				))}

				{pickedPoint && (
					<Marker position={[pickedPoint.lat, pickedPoint.lng]}>
						<Popup>Новая точка</Popup>
					</Marker>
				)}
			</MapContainer>
		</div>
	)
}
