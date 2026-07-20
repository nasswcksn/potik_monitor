// Database Pojok Statistik (Potik) BPS Jawa Timur
// Diselaraskan dengan list 57 Perguruan Tinggi mitra resmi dan logo aslinya

const rawUniversities = [
  {
    id: 1,
    bps_id: 86,
    name: "AKN Pacitan",
    university: "Akademi Komunitas Negeri Pacitan",
    city: "Pacitan",
    region: "Bakorwil I Madiun",
    lat: -8.1966,
    lng: 111.0899,
    contact: "Apriyanto Hadi Nugroho S.Si., M.Pd. (0812-5544-3322)",
    mou: "2023-05-18",
    token: "eyJpdiI6ImVnMDMwQkMwT2tXNVZSTEdwU3cyQWc9PSIsInZhbHVlIjoiaEczK1dIcHBHdVdBem5hajU2SFZOQT09IiwibWFjIjoiMjA4MDUyODVjMDEyMmFhNDQ2ZDk4NDNlODM3OWFkMTUyYzQ0ZmMxNzE3NTYwZTJiMDE3OGM1MDZiYWQwOGYyMSJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_AKN Pacitan_20230116105354.png"
  },
  {
    id: 2,
    bps_id: 84,
    name: "AKN BLITAR",
    university: "Akademi Komunitas Negeri Putra Sang Fajar Blitar",
    city: "Blitar",
    region: "Bakorwil III Malang",
    lat: -8.0954,
    lng: 112.1628,
    contact: "Drs. Solichin M.T. (0812-3344-5566)",
    mou: "2022-10-15",
    token: "eyJpdiI6IjBSWnB2VmVuaVBablVpZmVmRFpFWEE9PSIsInZhbHVlIjoiVjMxK3ptR2pKMGVWVjhxVGswV3poZz09IiwibWFjIjoiYjQ0MGUyZDM4ZmQzNGE4N2YyODI3OGRiODY4NTU4MmU1NWJmYzFmMDYxODE2ZTg4MjgxMTQ5ZDNjZDk1ZGQyYyJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_AKN BLITAR_20260205101155.png"
  },
  {
    id: 3,
    bps_id: 148,
    name: "IAI Attaqwa",
    university: "Institut Agama Islam At-Taqwa Bondowoso",
    city: "Bondowoso",
    region: "Bakorwil V Jember",
    lat: -7.9135,
    lng: 113.8217,
    contact: "Imron M.Si (0812-3001-4455)",
    mou: "2023-09-10",
    token: "eyJpdiI6ImtubFVsRXlqRVNSemI1dXo4dmVKXC9RPT0iLCJ2YWx1ZSI6IjhcL1dobW1sRlIzOHJmbXN1WW9JM1JnPT0iLCJtYWMiOiI3YTZiMTdhMjg4MTM4YWZlYWJhYWNlZTA1Mzc3NmM2N2VmYzgzNzNkMDQwMjc5MzMyMGZjMjM4MzUyNTRhZDEwIn0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/file-logo-iai-at-taqwa-bondowoso-2024-04-04-08-48-28.png"
  },
  {
    id: 4,
    bps_id: 187,
    name: "IAI Ngawi",
    university: "Institut Agama Islam Ngawi",
    city: "Ngawi",
    region: "Bakorwil I Madiun",
    lat: -7.4024,
    lng: 111.4449,
    contact: "M. Subhan M.Cs (0857-2233-4455)",
    mou: "2023-08-14",
    token: "eyJpdiI6InZyN1dKMlpUYUQrV0hrajJpNmZCa0E9PSIsInZhbHVlIjoiNFdxVWxiUHpvXC92VG5nb1wvMjI3MUlBPT0iLCJtYWMiOiI1ZDY4Njc4MGM5NmQwZTMzMDMwNTBjY2Y0MGVkZDAxMGJkMjEyOWJjMTNmMWJjMWYzNDBlYzQ5ZmZjZWE5N2Y3In0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/file-logo-iai-ngawi-2025-03-19-08-36-55.png"
  },
  {
    id: 5,
    bps_id: 60,
    name: "ITB WIGA",
    university: "Institut Teknologi dan Bisnis Widya Gama Lumajang",
    city: "Lumajang",
    region: "Bakorwil V Jember",
    lat: -8.1319,
    lng: 113.2238,
    contact: "Ir. Teguh M.T (0812-7788-9900)",
    mou: "2024-01-10",
    token: "eyJpdiI6ImRaN2tFU216bUZIcWVZRm5ub3BmRFE9PSIsInZhbHVlIjoiTGx4M0hJaGMyOEtzQmhPd3RKWmVxQT09IiwibWFjIjoiMThmODI2Y2Q5YmQzM2RkYTlmNDA5M2UyZmEwYTgzNzNlYzg1NThlNGE3Mzc4YjUxMDFhMGY2NDI2YjNjNDFiNiJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_ITB WIGA_20221101082137.png"
  },
  {
    id: 6,
    bps_id: 68,
    name: "ITS Mandala",
    university: "Institut Teknologi dan Sains Mandala Jember",
    city: "Jember",
    region: "Bakorwil V Jember",
    lat: -8.1845,
    lng: 113.6681,
    contact: "Dr. Hanafi (0813-3600-9900)",
    mou: "2022-12-05",
    token: "eyJpdiI6IlA3d1BcL3NyenVaWERzZ3B4aHd0MkpRPT0iLCJ2YWx1ZSI6Ims0aHBwelN3Ulg3WnFQK0VWdDI1WGc9PSIsIm1hYyI6IjI3YmUzYjBhY2NjNWQ5MDk3NTU1OTU1ZTM5N2M3MDJlZDk1NDdjOTkyM2RkODEyMzBlNDY4YTFhMzYzMzZlOTEifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_ITS Mandala Jember_20230116110604.png"
  },
  {
    id: 7,
    bps_id: 9,
    name: "ITS",
    university: "Institut Teknologi Sepuluh Nopember",
    city: "Surabaya",
    region: "Bakorwil III Malang",
    lat: -7.2824,
    lng: 112.7949,
    contact: "Dr. Eng. Muhammad (0812-3456-7890)",
    mou: "2021-06-15",
    token: "eyJpdiI6IklxeHl1M1FZdUdjb09GcWdoYStnNEE9PSIsInZhbHVlIjoiN3pOZjhqNlp6RjlHTExTOXdTSWh3dz09IiwibWFjIjoiNzM2NTcwMGRlZGZjYzhjNDliMzhmMjU4ZjlkM2NkNTE2OTM4YTAyNzZkMzM3MWEzYzIyZDYxOTE1ODc5OTY1ZiJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_ITS_20230116102931.png"
  },
  {
    id: 8,
    bps_id: 63,
    name: "Poltekkes Magetan",
    university: "Politeknik Kesehatan Kemenkes Surabaya Kampus Magetan",
    city: "Magetan",
    region: "Bakorwil I Madiun",
    lat: -7.6536,
    lng: 111.3317,
    contact: "Dr. Lilik (0812-3344-7788)",
    mou: "2022-10-05",
    token: "eyJpdiI6Im1CYlwvQ2ZZQU50Y1dXSDlzOERxdW1nPT0iLCJ2YWx1ZSI6IlJYcHNmaEk5bjhWbWF0M0liTHlhcGc9PSIsIm1hYyI6IjRmYWJlY2VjOTgyMzQ1NzI1OGUyZTYwMTFlNTQ3MWRmNWFkM2NkNGMzNGVjNmQwYjM1Njg5ZDZmZGY0NzcyMjkifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_Poltekkes Magetan_20260206133941.png"
  },
  {
    id: 9,
    bps_id: 147,
    name: "POLIWANGI",
    university: "Politeknik Negeri Banyuwangi",
    city: "Banyuwangi",
    region: "Bakorwil V Jember",
    lat: -8.2192,
    lng: 114.3691,
    contact: "Ir. Gunawan M.T (0812-4455-6677)",
    mou: "2022-10-22",
    token: "eyJpdiI6IlQSUkxla05ZM1wvZHRwNXYzQ1BHTml3PT0iLCJ2YWx1ZSI6Imc0R3M3M1ZXMGxxNHU2VHhDT1NnU0E9PSIsIm1hYyI6ImNmNWRkNTBhNTVmNDkzMDYzYjcwNGYyMTA1OTIxNmMyMzVmNDgxNDA0NDc1NzJmYTg3MWE0ZmIxYmVmOGVkNzkifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_20240229143641.png"
  },
  {
    id: 10,
    bps_id: 62,
    name: "PNM",
    university: "Politeknik Negeri Madiun",
    city: "Madiun",
    region: "Bakorwil I Madiun",
    lat: -7.6291,
    lng: 111.5243,
    contact: "Dr. Supri (0812-9900-5544)",
    mou: "2022-07-12",
    token: "eyJpdiI6IlwvQlRmcyt2ejljMUhKNWpXNTlsUDB3PT0iLCJ2YWx1ZSI6Ik5FelhmRjRYYlZXTVlmdU56ZHdWNnc9PSIsIm1hYyI6Ijk4MDRjMmU2YTJlNDU4YWZlZjgxMzI4MmYzY2EwOTVlZWU2Njc3Njc5NDQ2ZDM5MWY5NWYwYjdlNWFjOGIxNDIifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_PNM_20230116104302.png"
  },
  {
    id: 11,
    bps_id: 85,
    name: "STIKES BANYUWANGI/UNIVERSITAS DR SOEKARJO",
    university: "Sekolah Tinggi Ilmu Kesehatan Banyuwangi/UNIDSOE",
    city: "Banyuwangi",
    region: "Bakorwil V Jember",
    lat: -8.2241,
    lng: 114.3599,
    contact: "Khoirul M.Pd (0852-9988-7711)",
    mou: "2023-06-12",
    token: "eyJpdiI6IlBST2pVQVwvOFJcL1VvUndCWWsxUkM0dz09IiwidmFsdWUiOiIzRVRMK2t2SlFpbnErTXpybnRzQzJRPT0iLCJtYWMiOiIzZmNjYTNjM2E2YjQwNzRiYjQ0ODhjMTkxZDAyZmJjYjQzZWQwYjg1MGJjNTI0Njc3ZjE1OWFhYmEzMDA1ZDVjIn0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_STIKES BANYUWANGI_20251209100336.png"
  },
  {
    id: 12,
    bps_id: 81,
    name: "STIA Bayuangga",
    university: "Sekolah Tinggi Ilmu Administrasi Bayuangga",
    city: "Probolinggo",
    region: "Bakorwil V Jember",
    lat: -7.7569,
    lng: 113.2161,
    contact: "Dr. Ridwan (0812-9900-1122)",
    mou: "2023-05-30",
    token: "eyJpdiI6IlpYOVJucURNZHBWc2F1Smt1SWx2YkE9PSIsInZhbHVlIjoiREJXeWlmWXVEcytPK010TjMrWFF2Zz09IiwibWFjIjoiMmIwZTNiMWIxNGE5NzIwODM3MGNkOTdkNzZhMzY4OWQwYmUwODM0N2NmYWI2YWJlYWVjNmExNWU1M2Y3MTQ2YiJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_STIA Bayuangga_20230109114336.png"
  },
  {
    id: 13,
    bps_id: 165,
    name: "STIKES SBN",
    university: "Sekolah Tinggi Ilmu Kesehatan Satria Bhakti Nganjuk",
    city: "Nganjuk",
    region: "Bakorwil I Madiun",
    lat: -7.6024,
    lng: 111.9016,
    contact: "Siti Rahma M.Pd (0856-4433-2211)",
    mou: "2023-04-01",
    token: "eyJpdiI6IlhCbHJuQmpcL25iQXdcLzAxNTBIODRHUT09IiwidmFsdWUiOiJboxpWUENldDQ4MjFwUzFQWXdNc0R3PT0iLCJtYWMiOiJmNGFiM2RlYzQ1MTBmMzQzMTBkYWJmODcwZTVhOTgyNGUxZTM1MDY0MjcxOTY5ZjE3YzYzMWQ1MjhjOGE4ZDg4In0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_STIKES SBN_20241112150820.png"
  },
  {
    id: 14,
    bps_id: 218,
    name: "STKIP PGRI Pacitan",
    university: "Sekolah Tinggi Keguruan dan Ilmu Pendidikan PGRI Pacitan",
    city: "Pacitan",
    region: "Bakorwil I Madiun",
    lat: -8.2099,
    lng: 111.1121,
    contact: "M. Riza M.Pd (0813-8899-7755)",
    mou: "2023-09-12",
    token: "eyJpdiI6InNIRlwvRjBUSDlMMXp5OUhiRURpelpRPT0iLCJ2YWx1ZSI6IlwvSm5EQVpcL1pEQkE5elkraVwvN3MyU3c9PSIsIm1hYyI6IjRkNjc3ZGRhNDNjYzM3YWU2ZDU2OTM5ZDU5MDMwMGM0NGUzMjU0ODEzZTFjYTkxYzY1ZjlmZDQzMmJhZmU1ODAifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/file-logo-stkip-pgri-pacitan-2026-01-20-10-41-08.png"
  },
  {
    id: 15,
    bps_id: 101,
    name: "SV UNS",
    university: "Sekolah Vokasi Universitas Sebelas Maret Kabupaten Madiun",
    city: "Madiun",
    region: "Bakorwil I Madiun",
    lat: -7.6255,
    lng: 111.5188,
    contact: "Dr. Luluk (0813-8877-9900)",
    mou: "2022-11-28",
    token: "eyJpdiI6IkZ5TWtJMVRcL0t0UHYyMkFCemVtZGF3PT0iLCJ2YWx1ZSI6ImJtSW1kXC9YM09UenVlcmZtNjRZK25nPT0iLCJtYWMiOiI4MGQ2MTIxNGM2ODAzYTczMmIyYzM4ZjI4Yzg4NWY4ZGIzNDdiYjVkMDg5ZTMyN2VkYzg0ZmY0ZjVmNWIxYTgwIn0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_SV UNS_20230125120707.png"
  },
  {
    id: 16,
    bps_id: 131,
    name: "STIKES BHM",
    university: "STIKES Bhakti Husada Mulia Madiun",
    city: "Madiun",
    region: "Bakorwil I Madiun",
    lat: -7.6388,
    lng: 111.5366,
    contact: "Siti Nurul M.Stat. (0812-777-8899)",
    mou: "2023-04-10",
    token: "eyJpdiI6ImJtSVQ4eXViYUdZWUNadjUwYXVJaWc9PSIsInZhbHVlIjoiMGx4eU9nTEpleGU1WmhnRWUzdndsZz09IiwibWFjIjoiMWU3MTA4MzA1OTJhZmE4M2E4YTYwZThkNWFjYTIzNWQ3NzJmYWFiMmYxMDk5YzZlMTZmOTkxMjNlMTc5ZGNhMSJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_20231212144924.jpg"
  },
  {
    id: 17,
    bps_id: 65,
    name: "STKIP Trenggalek",
    university: "STKIP PGRI Trenggalek",
    city: "Trenggalek",
    region: "Bakorwil I Madiun",
    lat: -8.0788,
    lng: 111.7199,
    contact: "Drs. Yuni (0812-4455-9988)",
    mou: "2023-02-14",
    token: "eyJpdiI6IkZ0a2FcL2Z1dXhLQklIVTJcLzdMd0NTQT09IiwidmFsdWUiOiIxMHFlVXg2bDVESnBFazc4MHNQeDN3PT0iLCJtYWMiOiI1ZDYyNmUyNTY4NTIxZGE4OGI4YTNmMjBiMmFiNmEyY2RmNDdhMDFlMTAxYTliMjk5MjM4YjdiYmNkYWFlYWYwIn0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_STKIP PGRI Trenggalek_20221101090041.jpg"
  },
  {
    id: 18,
    bps_id: 212,
    name: "TelU Surabaya",
    university: "Telkom University Surabaya",
    city: "Surabaya",
    region: "Bakorwil III Malang",
    lat: -7.3194,
    lng: 112.7342,
    contact: "Akhmad S.Kom (0812-8888-9999)",
    mou: "2022-05-18",
    token: "eyJpdiI6ImUxRXZsbzhCanBkdHd4ZzZDd015QlE9PSIsInZhbHVlIjoiY1pHMkpmbG54WnRncG1sc3ZOUWVTdz09IiwibWFjIjoiYmY5MjllNmZiNjQ0ZjVjMDgwM2QwNTM3NTIyZTA2MzA0ODkwYzhmMzE0ZWEzMTFlNDA4NTdiYmJjYzBmNjhlMSJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/file-logo-tel-u-surabaya-2025-11-28-16-08-54.png"
  },
  {
    id: 19,
    bps_id: 115,
    name: "UNESA",
    university: "Universitas Negeri Surabaya",
    city: "Surabaya",
    region: "Bakorwil III Malang",
    lat: -7.3005,
    lng: 112.6749,
    contact: "Prof. Dr. Sujarwanto (0811-2233-4455)",
    mou: "2022-03-10",
    token: "eyJpdiI6IkphY21YclRuOWJSdlpCd3pWR1l4SEE9PSIsInZhbHVlIjoiZWlqaHUxTXVMNUdtTko1SXlyQngxdz09IiwibWFjIjoiM3MyYWQxNjdjYmE4ZTZlNzEzMWY4OTEyNGFlNTc0NGNiY2I3MmI4ZjAwMWJhNTE1ZWU0MTBlODM0ZGUyMDdiMSJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UNESA_20230710081449.png"
  },
  {
    id: 20,
    bps_id: 102,
    name: "UNARS",
    university: "Universitas Abdurachman Saleh Situbondo",
    city: "Situbondo",
    region: "Bakorwil V Jember",
    lat: -7.7088,
    lng: 113.9877,
    contact: "Sugiarto S.E (0813-5566-9900)",
    mou: "2023-10-18",
    token: "eyJpdiI6ImdDMjlcL3FnY3dKOWhHXC9hdVowR2U3UT09IiwidmFsdWUiOiJkU29hTjJsXC9cLzg3a3RaRXhFRmpvXC9BPT0iLCJtYWMiOiI3MTU5Njc5MzNjOGNmZjNlNmRjN2YwYzM4MTNjYWNmMzk2YjJhODAzZmU4ZjcwZTA1NzlhODYyN2RmNDgyNWVlIn0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UNARS_20230125121117.png"
  },
  {
    id: 21,
    bps_id: 199,
    name: "UNIBA Madura",
    university: "Universitas Bahaudin Mudhary Madura",
    city: "Sumenep",
    region: "Bakorwil IV Pamekasan",
    lat: -7.0084,
    lng: 113.8621,
    contact: "Dr. Sjaifurrachman (0812-3030-4040)",
    mou: "2022-09-30",
    token: "eyJpdiI6InZjMDBkUEJ4TGwyZ2Z6cktcL1MxdlZRPT0iLCJ2YWx1ZSI6IlQrMjQ3YjI3TDdlbm0rTVMyd3dSYmc9PSIsIm1hYyI6ImI4YmFmNGI0YjYxNzJkZmEyN2JjMWZjY2MxMjM2ZDU0NzIxZjc2NThiZGY3ZjU0MmI5N2M4YzVmMTE2YWVjMjMifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/file-logo-uniba-madura-2025-06-12-09-09-19.png"
  },
  {
    id: 22,
    bps_id: 89,
    name: "UBHI",
    university: "Universitas Bhinneka PGRI",
    city: "Tulungagung",
    region: "Bakorwil I Madiun",
    lat: -8.0673,
    lng: 111.9009,
    contact: "Prof. Dr. Maftukhin (0812-3322-1100)",
    mou: "2022-05-02",
    token: "eyJpdiI6IkZvVHNVTGdSclFLM2NTZzhIK3N4VWc9PSIsInZhbHVlIjoidFoyUjhqWm9WZGd5ajl3c0xLYzR0UT09IiwibWFjIjoiM3YyODVjN2IzNjVkMDExZjcxYzU2OTkzYWZhNTk5NzU4Y2QyMzkyMWZhNGFkMWE1ZTdmNjJkMjAwMDI1ZGJkOCJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UBHI_20230126105746.png"
  },
  {
    id: 23,
    bps_id: 103,
    name: "UNIGORO",
    university: "Universitas Bojonegoro",
    city: "Bojonegoro",
    region: "Bakorwil II Bojonegoro",
    lat: -7.1655,
    lng: 111.8903,
    contact: "Didik M.H (0812-7777-8888)",
    mou: "2023-03-08",
    token: "eyJpdiI6ImhtclozWUJRS3VxaEd4QW01MG9DNVE9PSIsInZhbHVlIjoiU3lHK3NidHdmZmpBYkxpdjE5SXVoZz09IiwibWFjIjoiMGFhOTAxNWQxZTM1N2QxMDY2OWQ3YjcxYWZkMTUyNjYyNWMxN2U0ZGUzZTcxYmU1ODM4NWVmNTc4NzFhYmM1NiJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UNIGORO_20230125161411.png"
  },
  {
    id: 24,
    bps_id: 61,
    name: "Unibo",
    university: "Universitas Bondowoso",
    city: "Bondowoso",
    region: "Bakorwil V Jember",
    lat: -7.9135 + 0.005,
    lng: 113.8217 + 0.005,
    contact: "Ir. Teguh (0812-7788-9900)",
    mou: "2024-01-10",
    token: "eyJpdiI6InNzWDc3QnpUWHpKRHJCOGJPSEg3cVE9PSIsInZhbHVlIjoiUmNpTGk1ZmZJMHI3QUMrZStQWmQ3Zz09IiwibWFjIjoiMGV4YmRmM2RiYjUyMzUxMjJjMjI3M2U0N2JmYjY2NWYxM2UyODc1MjRjOGI4ZmEwODY5NjkzN2VmZWI1MzYxZiJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_Unibo_20221101083619.png"
  },
  {
    id: 25,
    bps_id: 10,
    name: "UB",
    university: "Universitas Brawijaya",
    city: "Malang",
    region: "Bakorwil III Malang",
    lat: -7.9526,
    lng: 112.6144,
    contact: "Prof. Dr. Ir. Sasmito (0811-361-965)",
    mou: "2021-07-20",
    token: "eyJpdiI6Ik9uangySnpyaWxDZ1JqTlBzK2lZbkE9PSIsInZhbHVlIjoiUTFpZGMyU01UM1k4bmN5dXhmVFwvRVE9PSIsIm1hYyI6ImVhYTVlOWFiOWRlMTMxZmE1YzQ0NWFjOGEwNzEzYjgwZjkyYWM3YzRhNWU3M2QwMmE0YTg5NTliZGMyNTZjNzMifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UB_20230116103251.png"
  },
  {
    id: 26,
    bps_id: 151,
    name: "UNISDA",
    university: "Universitas Islam Darul 'Ulum Lamongan",
    city: "Lamongan",
    region: "Bakorwil II Bojonegoro",
    lat: -7.1265,
    lng: 112.3988,
    contact: "Umar M.Kom (0813-3344-1122)",
    mou: "2022-11-15",
    token: "eyJpdiI6IlwvTXh3MEV3bWhTMThVZXZBOWxuUVRnPT0iLCJ2YWx1ZSI6IjJ2TUs1akxBWFVyOTJkZGwrZlE1XC9RPT0iLCJtYWMiOiIxMjY5YTdmN2VjYjExOTUxOTZkM2YxM2VhYzc2ZDBmNmYzMTU1M2JmMWI0MGNlYTg0MWNhY2I1OTQ4MzhjZjViIn0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/file-logo-unisda-2024-05-14-13-10-53.jpg"
  },
  {
    id: 27,
    bps_id: 88,
    name: "UNISKA",
    university: "Universitas Islam Kadiri",
    city: "Kediri",
    region: "Bakorwil I Madiun",
    lat: -7.8211,
    lng: 112.0399,
    contact: "Drs. Ali M.Si (0813-3333-4444)",
    mou: "2022-12-15",
    token: "eyJpdiI6IllqRVlYdVd2XC9CdUtBd3lvbG0yTXVRPT0iLCJ2YWx1ZSI6IjFhYlBBR2lKa2pncUthSUdBXC9XMlpnPT0iLCJtYWMiOiI5ODRhMGM5MTA3Y2RjYjQyZmZlN2JkZmYzY2ZiODA2MzE0MjIyNWIzZmMzNDQwNjAwOTNiZGJkN2Q0NjY0N2QwIn0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UNISKA_20230109132220.png"
  },
  {
    id: 28,
    bps_id: 130,
    name: "UNISLA",
    university: "Universitas Islam Lamongan",
    city: "Lamongan",
    region: "Bakorwil II Bojonegoro",
    lat: -7.1141,
    lng: 112.4283,
    contact: "Dedi M.Si (0857-4455-6677)",
    mou: "2023-01-20",
    token: "eyJpdiI6IkxaWUxnXC8xa3d2bHc2TDI0UWQwbllRPT0iLCJ2YWx1ZSI6IkZVRTR2elBPWFlpWDBjMXVHYlVPRHc9PSIsIm1hYyI6ImVmNDU3MDYyYWRkOGJlMDlhYWYxNWMzMjFmZjVjMTJiZGFmZmE2YjE3ZWM1YjVhNTVmYzMyZWVjYzYwZDc0ODUifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_20230912084624.png"
  },
  {
    id: 29,
    bps_id: 25,
    name: "UNIM",
    university: "Universitas Islam Majapahit",
    city: "Mojokerto",
    region: "Bakorwil II Bojonegoro",
    lat: -7.4728,
    lng: 112.4381,
    contact: "Dr. Heru (0816-123-456)",
    mou: "2023-05-12",
    token: "eyJpdiI6IjY1bVwvVGZEQjBnWUdBNmhBZnRsUlBnPT0iLCJ2YWx1ZSI6ImpnUW40TkFTSVlFRnJZeHZJUHFlenc9PSIsIm1hYyI6ImQ1YjkwODY0NjQ3NDU3MTJlZTZiYWM4YTdhMWI3ODI2MmY0MjRkYTZmNzZjODU0OGVlNThiYjM2MjZiOGExNWIifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UNIM_20230116104503.png"
  },
  {
    id: 30,
    bps_id: 126,
    name: "UIN Madura",
    university: "Universitas Islam Negeri Madura",
    city: "Pamekasan",
    region: "Bakorwil IV Pamekasan",
    lat: -7.1488,
    lng: 113.4699,
    contact: "Dr. Ahmad (0878-5544-3322)",
    mou: "2023-03-25",
    token: "eyJpdiI6InNLWDJWaTVETHlSU1d4eHVmXC9WUjNRPT0iLCJ2YWx1ZSI6Ikt4cFVGdnRUaldNa0I4XC94XC9PMzRLdz09IiwibWFjIjoiYzAzN2NiOTg4NmU5Y2UyNzU2MzcxYjU1Yjk1MzhhOTU3MzQ1MjQyYzAwMWE4YWZmNWFjYjg2NDI1YzY1YThiNyJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UIN Madura_20251010081804.jpg"
  },
  {
    id: 31,
    bps_id: 146,
    name: "UIN SATU",
    university: "Universitas Islam Negeri Sayyid Ali Rahmatullah Tulungagung",
    city: "Tulungagung",
    region: "Bakorwil I Madiun",
    lat: -8.0842,
    lng: 111.8899,
    contact: "Prof. Dr. Maftukhin (0812-3322-1100)",
    mou: "2022-05-02",
    token: "eyJpdiI6Ik1pWGlodnh5M2QrVEQwd2R0UDRxNEE9PSIsInZhbHVlIjoiYm55S3Vqcnh1Z0lqcFdVTldlZ2ROQT09IiwibWFjIjoiMDg2MDIyN2E1N2QxMDIyOTQ1N2E4OGJiNzZjMmMwODkzMGYwMjg2MzE4ZGRmOWY5NzllYTMyMmE0MTEwODdjYyJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_20240228152734.png"
  },
  {
    id: 32,
    bps_id: 127,
    name: "UINSA",
    university: "Universitas Islam Negeri Sunan Ampel",
    city: "Surabaya",
    region: "Bakorwil III Malang",
    lat: -7.3194 + 0.005,
    lng: 112.7342 + 0.005,
    contact: "Akhmad S.Kom (0812-8888-9999)",
    mou: "2022-05-18",
    token: "eyJpdiI6ImpFOHdEbjJHeHA4bjFUVDhtcGRqYWc9PSIsInZhbHVlIjoiWDR0YkdRZkpZNEtDVEc5QXR0TzI3Zz09IiwibWFjIjoiNWM4NDNkYjNlOGY0Nzc0NjAwZTY0YmFmMTc1YzlhYWViZmRiYjNhMjZiNmNiNmUwYTRjNGRkNzQ4ZTliYjlkZCJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_20230911124944.png"
  },
  {
    id: 33,
    bps_id: 80,
    name: "UIN Syekh Wasil Kediri",
    university: "Universitas Islam Negeri Syekh Wasil Kediri",
    city: "Kediri",
    region: "Bakorwil I Madiun",
    lat: -7.8172,
    lng: 112.0118,
    contact: "Drs. Ali M.Si (0813-3333-4444)",
    mou: "2022-12-15",
    token: "eyJpdiI6ImV6YURFZXJlMm4zU2hsTFQ3QW1cLzZBPT0iLCJ2YWx1ZSI6ImpUNHNvS0JlZVR1bWpoYjR0UFN4aVE9PSIsIm1hYyI6IjkxODI0OTU3NGYwZWEwNTM4M2MxYTA5ODAzYjkyNzUyZDYzMzk4Nzc1Y2ZmNTQyNjk2YWU1NWFkN2U0YTMyY2MifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UIN Syekh Wasil Kediri_20250617084119.jpg"
  },
  {
    id: 34,
    bps_id: 149,
    name: "UKWMS",
    university: "Universitas Katolik Widya Mandala",
    city: "Surabaya",
    region: "Bakorwil III Malang",
    lat: -7.2519,
    lng: 112.7533,
    contact: "Agustina M.Si (0812-777-666)",
    mou: "2023-02-28",
    token: "eyJpdiI6IkR5bVpZcmN0R2szdXZTUzM4emJcL2N3PT0iLCJ2YWx1ZSI6IkltQ3Zncm8rVG1SbG02b0RvbWxMaEE9PSIsIm1hYyI6ImZiNjZkOWE3NWZmNDMxYWRjNjQwM2U2NWQ5ZWQ3YzQ4MWQwZjFhYmFiYjA0ZmIzMDdiNzA5MzAyYTE4ODk3NWMifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/file-logo-ukwms-2024-05-06-10-37-16.png"
  },
  {
    id: 35,
    bps_id: 70,
    name: "Ma Chung",
    university: "Universitas Ma Chung",
    city: "Malang",
    region: "Bakorwil III Malang",
    lat: -7.9388,
    lng: 112.6094,
    contact: "Dr. Badri (0819-3333-2222)",
    mou: "2022-06-18",
    token: "eyJpdiI6Ik4yaVZkcFdFMFQwc0JVbGJSQXFaR0E9PSIsInZhbHVlIjoiaDZ3Z0pPd2UrYVJFcXlMTUt5ZVJzUT09IiwibWFjIjoiOTMzZGM4YjRmNzhhN2ZhOTZhNDg5MDNiMDAxM2RmMDhjMDI3ZDU3YmRiZTlhOGU4ZTJiZGI2ZWQ5NzYyZDE5YSJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_Ma Chung_20221104091557.png"
  },
  {
    id: 36,
    bps_id: 57,
    name: "UNIMAS",
    university: "Universitas Mayjen Sungkono Mojokerto",
    city: "Mojokerto",
    region: "Bakorwil II Bojonegoro",
    lat: -7.4728 + 0.005,
    lng: 112.4381 + 0.005,
    contact: "Dr. Heru (0816-123-456)",
    mou: "2023-05-12",
    token: "eyJpdiI6IkZHVnRkdjZScXhxejNjSGZpT2FFNnc9PSIsInZhbHVlIjoiMnIzT2hmWlZpVndreHJYTlNTZGFOZz09IiwibWFjIjoiNGM1NjI4NzcyZmQ4N2YxOTljZDQ1NGUxMTVhYWE3NjQ2MDYzMjVjODQwMTYwODljNThhYzE1ZmIzOTkxMTJhZiJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UNIMAS_20221101080355.png"
  },
  {
    id: 37,
    bps_id: 219,
    name: "Unmer Malang",
    university: "Universitas Merdeka Malang",
    city: "Malang",
    region: "Bakorwil III Malang",
    lat: -7.9712,
    lng: 112.6153,
    contact: "Ir. Gunawan M.T (0812-4455-6677)",
    mou: "2022-10-22",
    token: "eyJpdiI6InloU3lIMmUrSkdlS1RCYytuUW1yMVE9PSIsInZhbHVlIjoiWThNZFAzd1wvWnFyYVE1KzhzOTd2aUE9PSIsIm1hYyI6ImJmOTA5YzZiMjg5ZTBkZjFjZWRiYmJmZDA4ZmJkYjVkM2U2YTE2OWI3NzM4ODM6MjQwZWE3ZjkyZmE2NTZkYTEifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/file-logo-unmer-malang-2026-01-29-10-21-15.png"
  },
  {
    id: 38,
    bps_id: 75,
    name: "UMG",
    university: "Universitas Muhammadiyah Gresik",
    city: "Gresik",
    region: "Bakorwil II Bojonegoro",
    lat: -7.1724,
    lng: 112.6183,
    contact: "Hidayat M.B.A (0813-8899-0011)",
    mou: "2023-08-19",
    token: "eyJpdiI6IkdJMGtEYjNZaWhjSlwvQ2ZRenJEcE13PT0iLCJ2YWx1ZSI6IjdYRnJnXC9CelNOcGdYc3RwTUFXZFlBPT0iLCJtYWMiOiJlN2EyOGU2NTEyMjViMGFmNjYwZjFlNDkyMzhmMDk5MzM4NzQ5NTc0MWEwOTQ1ZjkxN2IyN2Y5OGIzMTdiY2I2In0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UMG_20221230104347.png"
  },
  {
    id: 39,
    bps_id: 67,
    name: "UM Jember",
    university: "Universitas Muhammadiyah Jember",
    city: "Jember",
    region: "Bakorwil V Jember",
    lat: -8.1588,
    lng: 113.7255,
    contact: "Dr. Hanafi (0813-3600-9900)",
    mou: "2022-12-05",
    token: "eyJpdiI6IkNlcUs1VkdQeU1DYlF6Q2JISjNxSVE9PSIsInZhbHVlIjoiTWJ2bzJvRkdMaStUQllPXC9ROVdDc1E9PSIsIm1hYyI6IjQ3N2JmMDhjZDM3YmE0NzQ0YzEwMGQ4OTQwOGI0YThlNWQ1MjY5YjFlOGY0NzBjYmYwNDY3ZmEzNjkxZGZhN2IifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UM Jember_20230116105620.png"
  },
  {
    id: 40,
    bps_id: 87,
    name: "UMM",
    university: "Universitas Muhammadiyah Malang",
    city: "Malang",
    region: "Bakorwil III Malang",
    lat: -7.9213,
    lng: 112.5979,
    contact: "Dr. Ahmad (0812-888-555)",
    mou: "2022-01-20",
    token: "eyJpdiI6IjRUSHowTkhzTHNQUUJSSlpVRHVRWmc9PSIsInZhbHVlIjoiTHVJRTduUWdJOTA4KzZEQlhrVmNsUT09IiwibWFjIjoiMWYwZDNmOTUyYTMyNTFjNjNkMzc1MTNmY2UzM2ZiYWYyYTc2ZjM0MTk2ZmZmMmRmZjA5N2VmYTcyOGM3NmNmOSJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UMM_20230116105937.png"
  },
  {
    id: 41,
    bps_id: 58,
    name: "UMPO",
    university: "Universitas Muhammadiyah Ponorogo",
    city: "Ponorogo",
    region: "Bakorwil I Madiun",
    lat: -7.8688,
    lng: 111.4812,
    contact: "Dr. Happy (0813-4433-5566)",
    mou: "2022-10-18",
    token: "eyJpdiI6IjVZSE1hUzEwMU5HTiswMkY2dTdBZHc9PSIsInZhbHVlIjoiSGJ6TWxPdWFKUUNuUzFQTm9xY3ZIZz09IiwibWFjIjoiMDZkOTA2MTkyNmUxY2QzOGVlN2AyNWU4YjI4NDM3NWU2NzIyODM4YTU0NWNmNjkzYjQzNTg4M2RjNjdiNDRlNyJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UMPO_20221101081230.png"
  },
  {
    id: 42,
    bps_id: 143,
    name: "UMSIDA",
    university: "Universitas Muhammadiyah Sidoarjo",
    city: "Sidoarjo",
    region: "Bakorwil III Malang",
    lat: -7.4338,
    lng: 112.7183,
    contact: "Isnaini M.Kom (0812-9988-7766)",
    mou: "2022-02-15",
    token: "eyJpdiI6InMzcUV2QXVCM1hhTHU4aU9URUQ5c0E9PSIsInZhbHVlIjoiWGZEY3NGRjdLY1l6Z2pcL01QSCtYS2c9PSIsIm1hYyI6IjQ5MDJmM2I2NGZmODFkMDEzNTYxNzA2Y2IxNmE0NWNiZTI5M2RhYjNhMzliYTc3NGJlNzMyMTJhZmViNjlmZjgifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UMSIDA_20240620132444.png"
  },
  {
    id: 43,
    bps_id: 47,
    name: "UNU",
    university: "Universitas Nahdlatul Ulama Blitar",
    city: "Blitar",
    region: "Bakorwil III Malang",
    lat: -8.0954 + 0.005,
    lng: 112.1628 + 0.005,
    contact: "Drs. Solichin M.T. (0812-3344-5566)",
    mou: "2022-10-15",
    token: "eyJpdiI6Imp2UU9naEtsYnhtT2VXUWRSbVUzSHc9PSIsInZhbHVlIjoiM3FDQ21FXC8ySWNaWVE0NHNUZWZWa0E9PSIsIm1hYyI6ImZiYzRhOTZlOWYwMWMzMTk0ZTQ5Y2NiZTZkODVjYjNmNGU5YzZkOWU0YTE1MDUwNTZkMjBlNDY3YzVjYmQzNDkifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UNU BLITAR_20220929094154.png"
  },
  {
    id: 44,
    bps_id: 135,
    name: "UNUGIRI",
    university: "Universitas Nahdlatul Ulama Sunan Giri",
    city: "Bojonegoro",
    region: "Bakorwil II Bojonegoro",
    lat: -7.1488,
    lng: 111.8722,
    contact: "Dr. Hamam (0813-9999-0000)",
    mou: "2023-07-28",
    token: "eyJpdiI6IjQ4S2dpQmFzNTJ2b20yT0JwcVhBNXc9PSIsInZhbHVlIjoiaHhWak9FUXpFdFRVWXJNU0xHMnptUT09IiwibWFjIjoiZTNmNTA1NGFiMDRhNjkwMGI4ZjA4Mjk1MTRlMmE0YjNhOTcwNzY4ZTQwOTQyZmNiZTViMjIxNzg1YzdiMmU0YyJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_20230925093957.png"
  },
  {
    id: 45,
    bps_id: 132,
    name: "UNT",
    university: "Universitas Nazhatut Thullab Al-Muafa Sampang",
    city: "Sampang",
    region: "Bakorwil IV Pamekasan",
    lat: -7.1350,
    lng: 113.2500,
    contact: "Dr. Ahmad (0878-5544-3322)",
    mou: "2023-03-25",
    token: "eyJpdiI6Im05R0M5NVkxY05UVlVRbWRkWVwvQXRRPT0iLCJ2YWx1ZSI6InFZamdZT1wvOWczMGVVV1gxRnVoNDl3PT0iLCJtYWMiOiI5YmQ2MjhkZWNlMDAyYjRhOGI2YjA0Yjg4NDgyMTMzMzA0ZjlmZjgyNjg2Yjg0NTY4YmJjZGRiMzliMjVhMDU2In0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_20230918085926.png"
  },
  {
    id: 46,
    bps_id: 168,
    name: "UM",
    university: "Universitas Negeri Malang",
    city: "Malang",
    region: "Bakorwil III Malang",
    lat: -7.9619,
    lng: 112.6175,
    contact: "Drs. Solichin (0812-3344-5566)",
    mou: "2021-10-15",
    token: "eyJpdiI6Ijg0MlhIMHNzaHJXaXJTc2lIU2E3RXc9PSIsInZhbHVlIjoiMjNOdHF1OWNtRExiZDcrcUZIVEh0Zz09IiwibWFjIjoiYTljMjFhMWQxYWVkYmFjODMxOWI4NDk2YzE3ZjcyMTk2YWNlMDAxNDQ4NDhlYWI0NjNhNDkwOWM3ODZiYjlhYSJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/file-logo-um-2024-10-24-10-53-25.png"
  },
  {
    id: 47,
    bps_id: 71,
    name: "UNUJA",
    university: "Universitas Nurul Jadid",
    city: "Probolinggo",
    region: "Bakorwil V Jember",
    lat: -7.7842,
    lng: 113.4862,
    contact: "Taufiq M.T (0823-3344-5555)",
    mou: "2022-08-25",
    token: "eyJpdiI6ImZ4T3JzVUJYQ01GeG5FWW1FbzhqYnc9PSIsInZhbHVlIjoidVl1WFR3RjV3UGttQTFUcFExcUJSdz09IiwibWFjIjoiNTJjZmUyMDA1MWY3NTQ5M2JiYmU5ODU4MmNmNjU2N2FhNmMzMTUyMTE3ZTQzMjI3NzdjODE4MzRkNDUxOWRiMyJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UNUJA_20221104091918.png"
  },
  {
    id: 48,
    bps_id: 107,
    name: "UPNJATIM",
    university: "Universitas Pembangunan Nasional Veteran Jawa Timur",
    city: "Surabaya",
    region: "Bakorwil III Malang",
    lat: -7.3329,
    lng: 112.7887,
    contact: "Drs. Eko M.Si (0813-9876-5432)",
    mou: "2021-11-20",
    token: "eyJpdiI6Ikh6VldjMDM5cHhWaW5TTHo2cVBrOGc9PSIsInZhbHVlIjoia3dqVUt3VVBPOG5BVmhcL1VubWFZRkE9PSIsIm1hYyI6IjljNTIwMDhkMmRjZDRlZTNmM3QzOTA5MmEwYjg4NWIwYzI3MGQ3MDQ2OTg1NzU2N2VjYzlmZGRhN2YyMDFhMzMifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UPN V JT_20230315162551.png"
  },
  {
    id: 49,
    bps_id: 99,
    name: "UNIPDU",
    university: "Universitas Pesantren Tinggi Darul 'Ulum",
    city: "Jombang",
    region: "Bakorwil II Bojonegoro",
    lat: -7.5461,
    lng: 112.2331,
    contact: "Dr. H. Amir (0812-5555-1111)",
    mou: "2023-10-02",
    token: "eyJpdiI6ImZRWWhXY21NZkEwRUdtbGRWanhoeGc9PSIsInZhbHVlIjoidEdVMm5uckdVa0REMEUyZkZkZ0pKQT09IiwibWFjIjoiZjM2YzI1ODgyNzU3ODMzYWEwMTU1MTA3OGZkMTgwMDllODQxNjEyYzRlODEyNTM1MmVlNzg1ZWM0MTkwMTRjMiJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UNIPDU_20230112102909.png"
  },
  {
    id: 50,
    bps_id: 125,
    name: "UNIPASBY",
    university: "Universitas PGRI Adi Buana",
    city: "Surabaya",
    region: "Bakorwil III Malang",
    lat: -7.3458,
    lng: 112.7511,
    contact: "Siti Rahma M.Pd (0856-4433-2211)",
    mou: "2023-04-01",
    token: "eyJpdiI6IjRaeVJPZWR3c2k1NjBlTUJGV1A2VUE9PSIsInZhbHVlIjoiRmsxUzhkd0lGQjZ2ZFBZRWtJY3ZhUT09IiwibWFjIjoiYmQwZjIzNTZiMzFlZTJiMmMyMDM0NjY4ODA5OTIwNDE2YzMyNGQxZjNmYTVlOTg5OTY5NzBkMmNjMTJjNTQ0ZiJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_20230911124634.png"
  },
  {
    id: 51,
    bps_id: 66,
    name: "UNIPMA",
    university: "Universitas PGRI Madiun",
    city: "Madiun",
    region: "Bakorwil I Madiun",
    lat: -7.6388 + 0.005,
    lng: 111.5366 + 0.005,
    contact: "Dr. Supri (0812-9900-5544)",
    mou: "2022-07-12",
    token: "eyJpdiI6Ik90WWxoUnZGK1lKQlFhRkFxZFIwTFE9PSIsInZhbHVlIjoibUNmazJQQkRcLzFQcFdiUVBoSHIrQkE9PSIsIm1hYyI6IjRlYjYyYmNhYWYxNTUwZDBkYjljNzY3OWYzNDg1ZjFlZDc5YzEyYzg2ZTk3Y2EzYTU1Mzk5NmYwZjFhZmQxNDkifQ==",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UNIPMA_20221101092124.png"
  },
  {
    id: 52,
    bps_id: 26,
    name: "UPMS",
    university: "Universitas PGRI Mpu Sindok Nganjuk",
    city: "Nganjuk",
    region: "Bakorwil I Madiun",
    lat: -7.6024 + 0.005,
    lng: 111.9016 + 0.005,
    contact: "Siti Rahma M.Pd (0856-4433-2211)",
    mou: "2023-04-01",
    token: "eyJpdiI6ImRXeHJHbTk5Tnh2b3BJbERHaHJSOUE9PSIsInZhbHVlIjoicVZxVkZpTHRnMDBYbFJRUjJFZlFMUT09IiwibWFjIjoiMGFmMzQwMmI4Mzk1ZjcyNTdiZTk0M2MyZTY2NDViYzM3Yjg4YmIyNDU3MmE1NTA0MzZlOTAwNzFlNzE3NDg0MyJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_STKIP_20220725095526.jpg"
  },
  {
    id: 53,
    bps_id: 54,
    name: "Unirow",
    university: "Universitas PGRI Ronggolawe",
    city: "Tuban",
    region: "Bakorwil II Bojonegoro",
    lat: -6.8976,
    lng: 112.0620,
    contact: "Prof. Dr. Supiana (0812-3344-8899)",
    mou: "2022-09-15",
    token: "eyJpdiI6IkY3Sm1LVXBOd2xlRHRuUTRHZkU5bWc9PSIsInZhbHVlIjoiZUpsQ1ZOakpvRENKdW1nUmFmQUdWUT09IiwibWFjIjoiYmY5NjNiNmRjYjJmNDkwYWMzODAyZjYyYWU0MmRjM2VmODRmNjNkZjRjOWQzNjc4NmRlY2E4YjBlMTY0YTdmNCJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_Unirow_20230116110753.png"
  },
  {
    id: 54,
    bps_id: 59,
    name: "Uniwara",
    university: "Universitas PGRI Wiranegara Pasuruan",
    city: "Pasuruan",
    region: "Bakorwil III Malang",
    lat: -7.6508,
    lng: 112.9103,
    contact: "Edy S.H (0812-4900-3344)",
    mou: "2023-07-15",
    token: "eyJpdiI6IkVzZEdKXC9LM1FaOGJsXC81T0FyODYrdz09IiwidmFsdWUiOiJ6MDhSQ3RYQ2FZYkN5Yzlicnc4ZW13PT0iLCJtYWMiOiIzYzUxNTA4N2I5YmM2NTFlMmNjZjlkMDVmNzJmYWUwNTIyYTEwZTkzMzlkZTY3MjcwZWI1OTcxOTc4YTEwN2M2In0=",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_Uniwara Pasuruan_20221101081726.png"
  },
  {
    id: 55,
    bps_id: 98,
    name: "UTM",
    university: "Universitas Trunojoyo Madura",
    city: "Bangkalan",
    region: "Bakorwil IV Pamekasan",
    lat: -7.1276,
    lng: 112.7249,
    contact: "Dr. Gita (0852-5555-4433)",
    mou: "2021-08-15",
    token: "eyJpdiI6Im5OSTZxMWtCS3locFdKMXVGdGJrMkE9PSIsInZhbHVlIjoiRXZ4MURMaW41aHdhWDZBb0dxQ25xZz09IiwibWFjIjoiMDdmMWQ3NWE4NzBlZTQyNDg2NWY0OGFjNmIxZDBkNTQ4ZGRlMDYzNDIzNThkOWRhNDVkYTlkNmE4YmMzODNiMSJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UTM_20230112102701.png"
  },
  {
    id: 56,
    bps_id: 91,
    name: "Unita",
    university: "Universitas Tulungagung",
    city: "Tulungagung",
    region: "Bakorwil I Madiun",
    lat: -8.0673 + 0.005,
    lng: 111.9009 + 0.005,
    contact: "Prof. Dr. Maftukhin (0812-3322-1100)",
    mou: "2022-05-02",
    token: "eyJpdiI6Ikl0MnM4b3F5dnMyWDlVbTIxemFVT2c9PSIsInZhbHVlIjoiZFQ2SlAzYWZDMUtmZUZ1R1N6ZisrQT09IiwibWFjIjoiMzNiNWJhZWYzMzBiMGY0YWI0YzU0ZGYxYWZhZDgzN2E0YzYzNzliMjNlNGQ4YWNhOTNjYmY3MjEwMmZiZjQ5MyJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_Unita_20230116105529.png"
  },
  {
    id: 57,
    bps_id: 90,
    name: "UYP",
    university: "Universitas Yudharta Pasuruan",
    city: "Pasuruan",
    region: "Bakorwil III Malang",
    lat: -7.7121,
    lng: 112.7633,
    contact: "Imron M.Si (0812-3001-4455)",
    mou: "2023-09-10",
    token: "eyJpdiI6IndoUWFmTlFWS3dsYzU3MTVieEdadFE9PSIsInZhbHVlIjoiM3clockxEN2Vrb2pmZ2pGWUQ4MHhwUT09IiwibWFjIjoiMDY0NTI0ZjgxODg4YjA4Y2IwMGQ3OWRjNzczZGE5MDk4NDJlMjQ4ZmU0ZjBiODZhMzQ2OTA0YzY2M2Y5ZTYzOCJ9",
    logo: "https://pojokstatistik.bps.go.id/storage/university/logo_UYP_20230116104549.png"
  }
];

// Kata Kunci Judul & Deskripsi untuk Generator Data agar Realistis
const titlesDict = {
  infografis: [
    { name: "Tingkat penghunian kamar hotel di {city} bulan Juli 2025", desc: "Tingkat penghunian kamar hotel menggambarkan banyaknya penyewaan kamar hotel pada periode tertentu di {city}." },
    { name: "Keadaan Pendidikan {university} & Kabupaten {city} Tahun 2024", desc: "Persentase penduduk 15 ke atas menurut kemampuan membaca dan pendidikan tertinggi yang ditamatkan tahun 2024." },
    { name: "Keadaan Kependudukan Kabupaten {city} Tahun 2024", desc: "Visualisasi keadaan kependudukan kabupaten {city}, seperti persentase penduduk menurut umur, jenis kelamin, dan status perkawinan." },
    { name: "Indeks Pembangunan Manusia (IPM) Kabupaten {city} Tahun 2024", desc: "Pembangunan manusia di Kabupaten {city} terus mengalami kemajuan. Rata-rata meningkat 0.79% per tahun." },
    { name: "Jumlah Tenaga Kesehatan Perawat Menurut Provinsi dan Kabupaten {city} 2023", desc: "Persentase kenaikan tenaga kesehatan perawat dalam 8 tahun terakhir secara spasial." },
    { name: "Inflasi Gabungan Kabupaten/Kota di Jawa Timur Juni 2025", desc: "Perkembangan indeks harga konsumen dan laju inflasi bulanan serta tahunan di Jawa Timur." },
    { name: "Luas Panen dan Produksi Padi di Kabupaten {city} 2024", desc: "Realisasi luas panen padi dan total produksi beras di wilayah {city} selama setahun terakhir." },
    { name: "Statistik Kesejahteraan Rakyat Kabupaten {city} 2024", desc: "Menggambarkan kondisi kesehatan, perumahan, pengeluaran, dan kemiskinan di {city}." },
    { name: "Tingkat Pengangguran Terbuka (TPT) Kabupaten {city} 2024", desc: "Analisis ketenagakerjaan, persentase angkatan kerja yang tidak bekerja, dan tren penyerapan tenaga kerja." },
    { name: "Ekspor Impor Jawa Timur Triwulan I 2025", desc: "Data komoditas ekspor utama dan negara tujuan ekspor serta asal impor Jawa Timur." }
  ],
  video: [
    { name: "Pengenalan Pojok Statistik {name}", desc: "Video panduan fasilitas, buku referensi, dan cara konsultasi riset statistik gratis di {university}." },
    { name: "Edukasi Statistik: Apa itu Inflasi?", desc: "Video animasi sederhana menjelaskan konsep inflasi, cara penghitungan IHK, dan dampaknya bagi mahasiswa." },
    { name: "Sosialisasi Sensus Pertanian 2023 oleh Agen Statistik {city}", desc: "Dokumentasi agen statistik menyosialisasikan pentingnya data pertanian untuk masa depan kedaulatan pangan." },
    { name: "Tutorial Pemanfaatan Website BPS untuk Tugas Akhir", desc: "Cara mudah mencari data publik, mendownload tabel dinamis, dan membaca publikasi BPS untuk kebutuhan skripsi." },
    { name: "Bincang Statistik: Membaca Data Kemiskinan", desc: "Diskusi dosen ekonomi {name} bersama BPS Kabupaten {city} tentang cara membaca garis kemiskinan." }
  ],
  edukasi: [
    { name: "Buku Panduan Indikator Makro Sosial Ekonomi", desc: "Booklet ringkas penjelasan definisi operasional indikator IPM, Kemiskinan, Inflasi, dan PDRB." },
    { name: "Flyer Cara Mengakses Data Mikro (Raw Data) BPS", desc: "Panduan pengajuan perizinan akses data mikro untuk kebutuhan penelitian akademis." },
    { name: "Modul Praktikum Regresi Linear dengan Software R", desc: "Modul pelatihan analisis regresi menggunakan R-Studio yang diadakan di Pojok Statistik {name}." },
    { name: "Booklet Statistik Sektoral Jawa Timur 2024", desc: "Kompilasi data sektoral dinas-dinas di Jawa Timur untuk perbandingan riset regional." },
    { name: "Leaflet Pojok Statistik: Sahabat Data Anda", desc: "Brosur promosi layanan konsultasi gratis Pojok Statistik untuk sivitas akademika." }
  ],
  kegiatan: [
    { name: "Kuliah Umum: Literasi Data Statistik untuk Riset Akademik", desc: "Dosen tamu dari BPS memberikan pemaparan mengenai pemanfaatan open data BPS kepada 200 mahasiswa." },
    { name: "Pelatihan Software Pengolahan Data (SPSS & R-Studio)", desc: "Pojok Statistik {name} mengadakan workshop gratis bagi mahasiswa tingkat akhir untuk mendukung riset skripsi." },
    { name: "Statistik Goes to School - Sosialisasi ke SMA/MA Terdekat", desc: "Agen Statistik {name} melakukan kunjungan sekolah untuk mengenalkan cinta data sejak dini." },
    { name: "Focus Group Discussion (FGD) Evaluasi Pojok Statistik", desc: "Pertemuan koordinasi antara BPS Provinsi, BPS Kabupaten, dan dosen pembina Pojok Statistik {name}." },
    { name: "Lomba Visualisasi Data / Infografis Tingkat Universitas", desc: "Pojok Statistik {name} menggelar kompetisi infografis statistik untuk merayakan Hari Statistik Nasional." }
  ]
};

// Penulis tiruan
const authors = [
  "Apriyanto Hadi Nugroho S.Si., M.Pd.",
  "Hiffen Bilhaq Satrio Utomo",
  "Aidila Olivia Putri Ristanti",
  "Ikmal Farikh",
  "Rose Shinta Pramudita SST",
  "Dwi Wahyuni M.Stat.",
  "Rizky Ramadhan S.Tr.Stat.",
  "Siti Nurul Hidayah",
  "Alifia Rahmawati",
  "Bambang Susilo M.Si."
];

// Email Agen
const emails = [
  "aidilaristanti06@gmail.com",
  "bangfenz45@gmail.com",
  "ifarikh959@gmail.com",
  "potik_agent@univ.ac.id",
  "bps_admin@bps.go.id",
  "stat_lover21@gmail.com"
];

// Generator Data Konten untuk 1 Perguruan Tinggi
function generateContentsForUni(uni, countMultiplier) {
  const contents = {
    infografis: [],
    video: [],
    edukasi: [],
    kegiatan: []
  };

  // Jumlah item per jenis konten (bervariasi berdasarkan universitas dan multiplier keaktifan)
  const counts = {
    infografis: Math.floor((3 + Math.random() * 8) * countMultiplier),
    video: Math.floor((1 + Math.random() * 4) * countMultiplier),
    edukasi: Math.floor((2 + Math.random() * 6) * countMultiplier),
    kegiatan: Math.floor((1 + Math.random() * 3) * countMultiplier)
  };

  // Set minimum 0 jika multiplier 0
  if (countMultiplier === 0) {
    counts.infografis = 0;
    counts.video = 0;
    counts.edukasi = 0;
    counts.kegiatan = 0;
  }

  // Helper untuk format tanggal acak
  const getRandomDate = (startYear = 2024, endYear = 2025) => {
    const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
    const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
    const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const seconds = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 1. Generate Infografis
  for (let i = 0; i < counts.infografis; i++) {
    const template = titlesDict.infografis[Math.floor(Math.random() * titlesDict.infografis.length)];
    const penyusun = Math.random() > 0.4 ? 1 : 2; // 1 = BPS, 2 = Agen
    const fileExt = Math.random() > 0.5 ? "jpg" : "png";
    const name = template.name.replace(/{city}/g, uni.city).replace(/{university}/g, uni.name);
    const desc = template.desc.replace(/{city}/g, uni.city).replace(/{university}/g, uni.name);
    
    contents.infografis.push({
      id: 10000 + uni.id * 50 + i,
      name: name,
      description: desc,
      penyusun: penyusun,
      penyusun_badge: penyusun === 1 
        ? `<span class="badge badge-bps"><i class="fas fa-building"></i> BPS</span>`
        : `<span class="badge badge-agen"><i class="fas fa-users"></i> Agen</span>`,
      author_name: authors[Math.floor(Math.random() * authors.length)],
      created_at: getRandomDate(),
      views_count: Math.floor(Math.random() * 150),
      likes_count: Math.floor(Math.random() * 40),
      status: 1,
      file: `infografis/file_${uni.name.replace(/\s+/g, '')}_${i}.${fileExt}`,
      agen: penyusun === 2 ? emails[Math.floor(Math.random() * emails.length)] : null,
      thumbnail: `https://picsum.photos/400/500?random=${uni.id}1${i}`
    });
  }

  // 2. Generate Video
  for (let i = 0; i < counts.video; i++) {
    const template = titlesDict.video[Math.floor(Math.random() * titlesDict.video.length)];
    const penyusun = Math.random() > 0.3 ? 2 : 1;
    const name = template.name.replace(/{city}/g, uni.city).replace(/{university}/g, uni.name).replace(/{name}/g, uni.name);
    const desc = template.desc.replace(/{city}/g, uni.city).replace(/{university}/g, uni.name).replace(/{name}/g, uni.name);

    contents.video.push({
      id: 20000 + uni.id * 50 + i,
      name: name,
      description: desc,
      penyusun: penyusun,
      penyusun_badge: penyusun === 1 
        ? `<span class="badge badge-bps"><i class="fas fa-building"></i> BPS</span>`
        : `<span class="badge badge-agen"><i class="fas fa-users"></i> Agen</span>`,
      author_name: authors[Math.floor(Math.random() * authors.length)],
      created_at: getRandomDate(),
      views_count: Math.floor(Math.random() * 300),
      likes_count: Math.floor(Math.random() * 90),
      status: 1,
      file: `video/file_${uni.name.replace(/\s+/g, '')}_${i}.mp4`,
      agen: penyusun === 2 ? emails[Math.floor(Math.random() * emails.length)] : null,
      thumbnail: `https://picsum.photos/400/225?random=${uni.id}2${i}`,
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    });
  }

  // 3. Generate Edukasi
  for (let i = 0; i < counts.edukasi; i++) {
    const template = titlesDict.edukasi[Math.floor(Math.random() * titlesDict.edukasi.length)];
    const penyusun = Math.random() > 0.4 ? 1 : 2;
    const name = template.name.replace(/{city}/g, uni.city).replace(/{university}/g, uni.name).replace(/{name}/g, uni.name);
    const desc = template.desc.replace(/{city}/g, uni.city).replace(/{university}/g, uni.name).replace(/{name}/g, uni.name);

    contents.edukasi.push({
      id: 30000 + uni.id * 50 + i,
      name: name,
      description: desc,
      penyusun: penyusun,
      penyusun_badge: penyusun === 1 
        ? `<span class="badge badge-bps"><i class="fas fa-building"></i> BPS</span>`
        : `<span class="badge badge-agen"><i class="fas fa-users"></i> Agen</span>`,
      author_name: authors[Math.floor(Math.random() * authors.length)],
      created_at: getRandomDate(),
      views_count: Math.floor(Math.random() * 80),
      likes_count: Math.floor(Math.random() * 15),
      status: 1,
      file: `edukasi/file_${uni.name.replace(/\s+/g, '')}_${i}.pdf`,
      agen: penyusun === 2 ? emails[Math.floor(Math.random() * emails.length)] : null,
      thumbnail: `https://picsum.photos/300/400?random=${uni.id}3${i}`,
      type: i % 2 === 0 ? "Buku/Booklet" : "Flyer/Leaflet"
    });
  }

  // 4. Generate Kegiatan
  for (let i = 0; i < counts.kegiatan; i++) {
    const template = titlesDict.kegiatan[Math.floor(Math.random() * titlesDict.kegiatan.length)];
    const penyusun = 2; // Mayoritas agen
    const name = template.name.replace(/{city}/g, uni.city).replace(/{university}/g, uni.name).replace(/{name}/g, uni.name);
    const desc = template.desc.replace(/{city}/g, uni.city).replace(/{university}/g, uni.name).replace(/{name}/g, uni.name);

    contents.kegiatan.push({
      id: 40000 + uni.id * 50 + i,
      name: name,
      description: desc,
      penyusun: penyusun,
      penyusun_badge: `<span class="badge badge-agen"><i class="fas fa-users"></i> Agen</span>`,
      author_name: authors[Math.floor(Math.random() * authors.length)],
      created_at: getRandomDate(2025, 2025),
      views_count: Math.floor(Math.random() * 120),
      likes_count: Math.floor(Math.random() * 30),
      status: 1,
      file: `kegiatan/file_${uni.name.replace(/\s+/g, '')}_${i}.jpg`,
      agen: emails[Math.floor(Math.random() * emails.length)],
      thumbnail: `https://picsum.photos/600/400?random=${uni.id}4${i}`,
      date: getRandomDate().split(' ')[0]
    });
  }

  return contents;
}

// Inisialisasi Database 57 Perguruan Tinggi dari file JSON publik (di /public/potikDataFiltered.json)
// Menggunakan fetch() agar tidak masuk ke bundle JS (menghindari bundle >8MB)
export const getInitialPotikData = async () => {
  const response = await fetch('/potikDataFiltered.json');
  if (!response.ok) throw new Error(`Gagal memuat potikDataFiltered.json: ${response.status}`);
  return await response.json();
};
