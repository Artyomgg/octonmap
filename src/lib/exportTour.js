import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

export async function exportTourToDocx(tour) {
	if (!tour || !tour.stops?.length) {
		throw new Error('Нет данных для экспорта')
	}

	const children = []

	// Заголовок экскурсии
	children.push(
		new Paragraph({
			text: tour.title || 'Экскурсия',
			heading: HeadingLevel.HEADING_1,
			alignment: AlignmentType.CENTER,
			spacing: { after: 300 },
		}),
	)

	// Подзаголовок
	children.push(
		new Paragraph({
			children: [
				new TextRun({
					text: 'Октябрьский район · Минск',
					italics: true,
					color: '6b7a99',
					size: 22,
				}),
			],
			alignment: AlignmentType.CENTER,
			spacing: { after: 400 },
		}),
	)

	// Вступление
	if (tour.intro) {
		children.push(
			new Paragraph({
				children: [new TextRun({ text: tour.intro, italics: true })],
				spacing: { after: 300 },
			}),
		)
	}

	// Остановки
	children.push(
		new Paragraph({
			text: 'Маршрут',
			heading: HeadingLevel.HEADING_2,
			spacing: { before: 200, after: 200 },
		}),
	)

	tour.stops.forEach((stop, i) => {
		const p = stop.place

		// Номер + название
		children.push(
			new Paragraph({
				children: [
					new TextRun({
						text: `${i + 1}. `,
						bold: true,
						size: 28,
						color: '1b2a4a',
					}),
					new TextRun({
						text: p.title,
						bold: true,
						size: 28,
						color: '1b2a4a',
					}),
				],
				spacing: { before: 240, after: 80 },
			}),
		)

		// Мета: категория, адрес, координаты
		const meta = []
		if (p.category) meta.push(`Категория: ${p.category}`)
		if (p.address) meta.push(`Адрес: ${p.address}`)
		if (p.lat && p.lng) meta.push(`Координаты: ${p.lat}, ${p.lng}`)

		if (meta.length) {
			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: meta.join(' · '),
							size: 20,
							color: '6b7a99',
						}),
					],
					spacing: { after: 120 },
				}),
			)
		}

		// 🔥 ГЛАВНОЕ: полный текст для экскурсовода
		if (stop.script) {
			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: 'Текст для экскурсовода (4 минуты):',
							bold: true,
							size: 24,
							color: '1b2a4a',
						}),
					],
					spacing: { before: 160, after: 120 },
				}),
			)

			// Разбиваем длинный текст на абзацы по предложениям
			// (или по \n, если модель их ставит)
			const paragraphs = stop.script
				.split(/\n+/)
				.map(s => s.trim())
				.filter(Boolean)

			paragraphs.forEach(text => {
				children.push(
					new Paragraph({
						children: [
							new TextRun({
								text,
								size: 22,
							}),
						],
						spacing: { after: 140 },
						indent: { left: 300 },
						alignment: AlignmentType.JUSTIFIED,
					}),
				)
			})
		}

		// Короткий комментарий (для превью)
		if (stop.comment && stop.comment !== stop.script) {
			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: 'Кратко: ',
							bold: true,
							italics: true,
							size: 20,
							color: '6b7a99',
						}),
						new TextRun({
							text: stop.comment,
							italics: true,
							size: 20,
							color: '6b7a99',
						}),
					],
					spacing: { before: 140, after: 200 },
					indent: { left: 300 },
				}),
			)
		}

		// Описание места из базы
		if (p.description) {
			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: 'Описание: ',
							bold: true,
							size: 22,
						}),
						new TextRun({
							text: p.description,
							size: 22,
						}),
					],
					spacing: { after: 200 },
					indent: { left: 300 },
				}),
			)
		}

		// Ссылка на фото
		if (p.photo_url) {
			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: 'Фото: ',
							bold: true,
							size: 20,
						}),
						new TextRun({
							text: p.photo_url,
							size: 20,
							color: '2a4a8a',
						}),
					],
					spacing: { after: 160 },
					indent: { left: 300 },
				}),
			)
		}
	})

	// Заключение
	if (tour.outro) {
		children.push(
			new Paragraph({
				text: 'Заключение',
				heading: HeadingLevel.HEADING_2,
				spacing: { before: 400, after: 160 },
			}),
		)
		children.push(
			new Paragraph({
				children: [new TextRun({ text: tour.outro, italics: true })],
				spacing: { after: 200 },
			}),
		)
	}

	const doc = new Document({
		sections: [
			{
				properties: {},
				children,
			},
		],
	})

	const blob = await Packer.toBlob(doc)
	const safeName = (tour.title || 'Экскурсия')
		.replace(/[^\wа-яА-ЯёЁ\s-]/g, '')
		.trim()
		.slice(0, 60)

	saveAs(blob, `${safeName}.docx`)
}
