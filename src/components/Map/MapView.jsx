import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import {
	GeoJSON,
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
	useMapEvents,
} from 'react-leaflet'
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

const ActiveIcon = L.icon({
	iconUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
	shadowUrl: iconShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

const CENTER = [53.8589, 27.6952]
const OKTYABRSKY_BOUNDS = [
	[53.6935, 27.3738],
	[54.0243, 28.0165],
]

const BORDER_STYLE = {
	color: '#ffcc00',
	weight: 3,
	opacity: 0.85,
	fillColor: '#ffcc00',
	fillOpacity: 0.08,
}

function ClickHandler({ onMapClick }) {
	useMapEvents({
		click(e) {
			if (onMapClick) onMapClick(e.latlng)
		},
	})
	return null
}

function MapController({ mapRef, targetCoords }) {
	const map = useMap()

	useEffect(() => {
		if (mapRef) mapRef.current = map
	}, [map, mapRef])

	useEffect(() => {
		if (targetCoords) {
			map.flyTo([targetCoords.lat, targetCoords.lng], 17, { duration: 1 })
		}
	}, [targetCoords, map])

	return null
}

export default function MapView({
	places = [],
	onMapClick,
	pickedPoint,
	mapRef,
	activeId,
	onMarkerClick,
	targetCoords,
}) {
	const [geoJsonData, setGeoJsonData] = useState(null)

	useEffect(() => {
		fetch('/oktyabrsky.geojson')
			.then(r => (r.ok ? r.json() : null))
			.then(setGeoJsonData)
			.catch(err => console.error('Ошибка загрузки GeoJSON:', err))
	}, [])

	return (
		<div className={styles.wrapper}>
			<MapContainer
				center={CENTER}
				zoom={12}
				className={styles.map}
				maxBounds={OKTYABRSKY_BOUNDS}
				maxBoundsViscosity={1.0}
				minZoom={11}
			>
				<TileLayer
					attribution='&copy; OpenStreetMap contributors'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>

				<MapController mapRef={mapRef} targetCoords={targetCoords} />

				{geoJsonData && <GeoJSON data={geoJsonData} style={BORDER_STYLE} />}

				<ClickHandler onMapClick={onMapClick} />

				{places.map(place => {
					const isActive = place.id === activeId
					return (
						<Marker
							key={place.id}
							position={[place.lat, place.lng]}
							icon={isActive ? ActiveIcon : DefaultIcon}
							eventHandlers={{
								click: () => onMarkerClick?.(place),
							}}
						>
							<Popup>
								<div className={styles.popup}>
									{place.photo_url && (
										<img
											src={place.photo_url}
											alt={place.title}
											className={styles.popupImg}
											onError={e => {
												e.target.style.display = 'none'
											}}
										/>
									)}
									<strong className={styles.popupTitle}>{place.title}</strong>
									<span className={styles.popupCat}>{place.category}</span>
									{place.address && <span className={styles.popupAddr}>📍 {place.address}</span>}
									<Link to={`/place/${place.id}`} className={styles.popupLink}>
										Подробнее →
									</Link>
								</div>
							</Popup>
						</Marker>
					)
				})}

				{pickedPoint && (
					<Marker position={[pickedPoint.lat, pickedPoint.lng]} icon={ActiveIcon}>
						<Popup>Новая точка</Popup>
					</Marker>
				)}
			</MapContainer>
		</div>
	)
}
