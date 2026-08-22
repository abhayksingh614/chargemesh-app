import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  FlatList,
  Platform,
  PermissionsAndroid,
  Animated,
  Dimensions,
  PanResponder,
  Modal,
} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { mockStations, StationWithDetails } from '../services/mockData';
// Master data inlined below
import { StationCard, ActiveSessionBanner } from '../components';
import { borderRadius } from '../theme';
import { useCharging, useTheme } from '../context';

// Direct Inlined Master State & District Database (36 States, 719 Districts)
const ALL_STATES: string[] = [
  "Andaman & Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra & Nagar Haveli",
  "Daman and Diu",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Nct of Delhi",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const STATE_DISTRICT_MAP: Record<string, string[]> = {
  "Andaman & Nicobar Islands": [
    "Nicobars",
    "North and Middle Andaman",
    "South Andaman"
  ],
  "Andhra Pradesh": [
    "Anantapur",
    "Chittoor",
    "East Godavari",
    "Guntur",
    "Krishna",
    "Kurnool",
    "Prakasam",
    "Sri Potti Sriramulu Nellore",
    "Srikakulam",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "Y.S.R."
  ],
  "Arunachal Pradesh": [
    "Anjaw",
    "Changlang",
    "Dibang Valley",
    "East Kameng",
    "East Siang",
    "Kra Daadi",
    "Kurung Kumey",
    "Lohit",
    "Lower Dibang Valley",
    "Lower Siang",
    "Lower Subansiri",
    "Namsai",
    "Papum Pare",
    "Siang",
    "Tawang",
    "Tirap",
    "Upper Siang",
    "Upper Subansiri",
    "West Kameng",
    "West Siang"
  ],
  "Assam": [
    "Baksa",
    "Barpeta",
    "Biswanath",
    "Bongaigaon",
    "Cachar",
    "Charaideo",
    "Chirang",
    "Darrang",
    "Dhemaji",
    "Dhubri",
    "Dibrugarh",
    "Dima Hasao",
    "Goalpara",
    "Golaghat",
    "Hailakandi",
    "Hojai",
    "Jorhat",
    "Kamrup",
    "Kamrup Metropolitan",
    "Karbi Anglong",
    "Karimganj",
    "Kokrajhar",
    "Lakhimpur",
    "Majuli",
    "Morigaon",
    "Nagaon",
    "Nalbari",
    "Sivasagar",
    "Sonitpur",
    "South Salamara-Mankachar",
    "Tinsukia",
    "Udalguri",
    "West Karbi Anglong"
  ],
  "Bihar": [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur (Bhabua)",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Pashchim Champaran",
    "Patna",
    "Purbi Champaran",
    "Purnia",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali"
  ],
  "Chandigarh": [
    "Chandigarh"
  ],
  "Chhattisgarh": [
    "Balod",
    "Baloda Bazar",
    "Balrampur",
    "Bastar",
    "Bemetara",
    "Bijapur",
    "Bilaspur",
    "Dakshin Bastar Dantewada",
    "Dhamtari",
    "Durg",
    "Gariyaband",
    "Janjgir - Champa",
    "Jashpur",
    "Kabeerdham",
    "Kondagaon",
    "Korba",
    "Koriya",
    "Mahasamund",
    "Mungeli",
    "Narayanpur",
    "Raigarh",
    "Raipur",
    "Rajnandgaon",
    "Sukma",
    "Surajpur",
    "Surguja",
    "Uttar Bastar Kanker"
  ],
  "Dadra & Nagar Haveli": [
    "Dadra and Nagar Haveli"
  ],
  "Daman and Diu": [
    "Daman",
    "Diu"
  ],
  "Goa": [
    "North Goa",
    "South Goa"
  ],
  "Gujarat": [
    "Ahmadabad",
    "Amreli",
    "Anand",
    "Arvalli",
    "Banas Kantha",
    "Bharuch",
    "Bhavnagar",
    "Botad",
    "Chhota Udepur",
    "Devbhoomi Dwarka",
    "Dohad",
    "Gandhinagar",
    "Gir Somnath",
    "Jamnagar",
    "Junagadh",
    "Kachchh",
    "Kheda",
    "Mahesana",
    "Mahisagar",
    "Morbi",
    "Narmada",
    "Navsari",
    "Panch Mahals",
    "Patan",
    "Porbandar",
    "Rajkot",
    "Sabar Kantha",
    "Surat",
    "Surendranagar",
    "Tapi",
    "The Dangs",
    "Vadodara",
    "Valsad"
  ],
  "Haryana": [
    "Ambala",
    "Bhiwani",
    "Charkhi Dadri",
    "Faridabad",
    "Fatehabad",
    "Gurgaon",
    "Hisar",
    "Jhajjar",
    "Jind",
    "Kaithal",
    "Karnal",
    "Kurukshetra",
    "Mahendragarh",
    "Mewat",
    "Palwal",
    "Panchkula",
    "Panipat",
    "Rewari",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Yamunanagar"
  ],
  "Himachal Pradesh": [
    "Bilaspur",
    "Chamba",
    "Hamirpur",
    "Kangra",
    "Kinnaur",
    "Kullu",
    "Lahul Spiti",
    "Mandi",
    "Shimla",
    "Sirmaur",
    "Solan",
    "Una"
  ],
  "Jammu and Kashmir": [
    "Anantnag",
    "Badgam",
    "Bandipore",
    "Baramula",
    "Doda",
    "Ganderbal",
    "Jammu",
    "Kargil",
    "Kathua",
    "Kishtwar",
    "Kulgam",
    "Kupwara",
    "Leh(Ladakh)",
    "Pulwama",
    "Punch",
    "Rajouri",
    "Ramban",
    "Reasi",
    "Samba",
    "Shupiyan",
    "Srinagar",
    "Udhampur"
  ],
  "Jharkhand": [
    "Bokaro",
    "Chatra",
    "Deoghar",
    "Dhanbad",
    "Dumka",
    "Garhwa",
    "Giridih",
    "Godda",
    "Gumla",
    "Hazaribagh",
    "Jamtara",
    "Khunti",
    "Kodarma",
    "Latehar",
    "Lohardaga",
    "Pakur",
    "Palamu",
    "Pashchimi Singhbhum",
    "Purbi Singhbhum",
    "Ramgarh",
    "Ranchi",
    "Sahibganj",
    "Saraikela-Kharsawan",
    "Simdega"
  ],
  "Karnataka": [
    "Bagalkot",
    "Bangalore",
    "Bangalore Rural",
    "Belgaum",
    "Bellary",
    "Bidar",
    "Bijapur",
    "Chamarajanagar",
    "Chikkaballapura",
    "Chikmagalur",
    "Chitradurga",
    "Dakshina Kannada",
    "Davanagere",
    "Dharwad",
    "Gadag",
    "Gulbarga",
    "Hassan",
    "Haveri",
    "Kodagu",
    "Kolar",
    "Koppal",
    "Mandya",
    "Mysore",
    "Raichur",
    "Ramanagara",
    "Shimoga",
    "Tumkur",
    "Udupi",
    "Uttara Kannada",
    "Yadgir"
  ],
  "Kerala": [
    "Alappuzha",
    "Ernakulam",
    "Idukki",
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad"
  ],
  "Lakshadweep": [
    "Lakshadweep"
  ],
  "Madhya Pradesh": [
    "Agar Malwa",
    "Alirajpur",
    "Anuppur",
    "Ashoknagar",
    "Balaghat",
    "Barwani",
    "Betul",
    "Bhind",
    "Bhopal",
    "Burhanpur",
    "Chhatarpur",
    "Chhindwara",
    "Damoh",
    "Datia",
    "Dewas",
    "Dhar",
    "Dindori",
    "Guna",
    "Gwalior",
    "Harda",
    "Hoshangabad",
    "Indore",
    "Jabalpur",
    "Jhabua",
    "Katni",
    "Khandwa (East Nimar)",
    "Khargone (West Nimar)",
    "Mandla",
    "Mandsaur",
    "Morena",
    "Narsimhapur",
    "Neemuch",
    "Panna",
    "Raisen",
    "Rajgarh",
    "Ratlam",
    "Rewa",
    "Sagar",
    "Satna",
    "Sehore",
    "Seoni",
    "Shahdol",
    "Shajapur",
    "Sheopur",
    "Shivpuri",
    "Sidhi",
    "Singrauli",
    "Tikamgarh",
    "Ujjain",
    "Umaria",
    "Vidisha"
  ],
  "Maharashtra": [
    "Ahmadnagar",
    "Akola",
    "Amravati",
    "Aurangabad",
    "Bhandara",
    "Bid",
    "Buldana",
    "Chandrapur",
    "Dhule",
    "Gadchiroli",
    "Gondiya",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Osmanabad",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigarh",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal"
  ],
  "Manipur": [
    "Bishnupur",
    "Chandel",
    "Churachandpur",
    "Imphal East",
    "Imphal West",
    "Jiribam",
    "Kakching",
    "Kamjong",
    "Kangpokpi",
    "Noney",
    "Pherzawl",
    "Senapati",
    "Tamenglong",
    "Tengnoupal",
    "Thoubal",
    "Ukhrul"
  ],
  "Meghalaya": [
    "East Garo Hills",
    "East Jaintia Hills",
    "East Khasi Hills",
    "Jaintia Hills",
    "North Garo Hills",
    "Ribhoi",
    "South Garo Hills",
    "South West Garo Hills",
    "South West Khasi Hills",
    "West Garo Hills",
    "West Jaintia Hills",
    "West Khasi Hills"
  ],
  "Mizoram": [
    "Aizawl",
    "Champhai",
    "Kolasib",
    "Lawngtlai",
    "Lunglei",
    "Mamit",
    "Saiha",
    "Serchhip"
  ],
  "Nagaland": [
    "Dimapur",
    "Kiphire",
    "Kohima",
    "Longleng",
    "Mokokchung",
    "Mon",
    "Peren",
    "Phek",
    "Tuensang",
    "Wokha",
    "Zunheboto"
  ],
  "Nct of Delhi": [
    "Central",
    "East",
    "New Delhi",
    "North",
    "North East",
    "North West",
    "Shahdara",
    "South",
    "South East Delhi",
    "South West",
    "West"
  ],
  "Odisha": [
    "Anugul",
    "Balangir",
    "Baleshwar",
    "Bargarh",
    "Baudh",
    "Bhadrak",
    "Cuttack",
    "Debagarh",
    "Dhenkanal",
    "Gajapati",
    "Ganjam",
    "Jagatsinghapur",
    "Jajapur",
    "Jharsuguda",
    "Kalahandi",
    "Kandhamal",
    "Kendrapara",
    "Kendujhar",
    "Khordha",
    "Koraput",
    "Malkangiri",
    "Mayurbhanj",
    "Nabarangapur",
    "Nayagarh",
    "Nuapada",
    "Puri",
    "Rayagada",
    "Sambalpur",
    "Subarnapur",
    "Sundargarh"
  ],
  "Puducherry": [
    "Karaikal",
    "Mahe",
    "Puducherry",
    "Yanam"
  ],
  "Punjab": [
    "Amritsar",
    "Barnala",
    "Bathinda",
    "Faridkot",
    "Fatehgarh Sahib",
    "Fazilka",
    "Firozpur",
    "Gurdaspur",
    "Hoshiarpur",
    "Jalandhar",
    "Kapurthala",
    "Ludhiana",
    "Mansa",
    "Moga",
    "Muktsar",
    "Pathankot",
    "Patiala",
    "Rupnagar",
    "Sahibzada Ajit Singh Nagar",
    "Sangrur",
    "Shahid Bhagat Singh Nagar",
    "Tarn Taran"
  ],
  "Rajasthan": [
    "Ajmer",
    "Alwar",
    "Banswara",
    "Baran",
    "Barmer",
    "Bharatpur",
    "Bhilwara",
    "Bikaner",
    "Bundi",
    "Chittaurgarh",
    "Churu",
    "Dausa",
    "Dhaulpur",
    "Dungarpur",
    "Hanumangarh",
    "Jaipur",
    "Jaisalmer",
    "Jalor",
    "Jhalawar",
    "Jhunjhunun",
    "Jodhpur",
    "Karauli",
    "Kota",
    "Nagaur",
    "Pali",
    "Pratapgarh",
    "Rajsamand",
    "Sawai Madhopur",
    "Sikar",
    "Sirohi",
    "Sri Ganganagar",
    "Tonk",
    "Udaipur"
  ],
  "Sikkim": [
    "East District",
    "North  District",
    "South District",
    "West District"
  ],
  "Tamil Nadu": [
    "Ariyalur",
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kancheepuram",
    "Kanniyakumari",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Nagapattinam",
    "Namakkal",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Salem",
    "Sivaganga",
    "Thanjavur",
    "The Nilgiris",
    "Theni",
    "Thiruvallur",
    "Thiruvarur",
    "Thoothukkudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tiruppur",
    "Tiruvannamalai",
    "Vellore",
    "Viluppuram",
    "Virudhunagar"
  ],
  "Telangana": [
    "Adilabad",
    "Bhadradri",
    "Hyderabad",
    "Jagtial",
    "Jangaon",
    "Jayashankar",
    "Jogulamba",
    "Kamareddy",
    "Karimnagar",
    "Khammam",
    "Komaram Bheem",
    "Mahabubabad",
    "Mahbubnagar",
    "Mancherial",
    "Medak",
    "Medchal-Malkajgiri",
    "Nagarkurnool",
    "Nalgonda",
    "Nirmal",
    "Nizamabad",
    "Peddapalli",
    "Rajanna",
    "Rangareddy",
    "Sangareddy",
    "Siddipet",
    "Suryapet",
    "Vikarabad",
    "Wanaparthy",
    "Warangal Rural",
    "Warangal Urban",
    "Yadadri"
  ],
  "Tripura": [
    "Dhalai",
    "Gomati",
    "Khowai",
    "North Tripura",
    "Sepahijala",
    "South Tripura",
    "Unakoti",
    "West Tripura"
  ],
  "Uttar Pradesh": [
    "Agra",
    "Aligarh",
    "Allahabad",
    "Ambedkar Nagar",
    "Amethi",
    "Amroha",
    "Auraiya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Bara Banki",
    "Bareilly",
    "Basti",
    "Bhadohi",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Faizabad",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gautam Buddha Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kasganj",
    "Kaushambi",
    "Kheri",
    "Kushinagar",
    "Lalitpur",
    "Lucknow",
    "Mahoba",
    "Mahrajganj",
    "Mainpuri",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "Rae Bareli",
    "Rampur",
    "Saharanpur",
    "Sambhal",
    "Sant Kabir Nagar",
    "Shahjahanpur",
    "Shamli",
    "Shrawasti",
    "Siddharthnagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi"
  ],
  "Uttarakhand": [
    "Almora",
    "Bageshwar",
    "Chamoli",
    "Champawat",
    "Dehradun",
    "Garhwal",
    "Hardwar",
    "Nainital",
    "Pithoragarh",
    "Rudraprayag",
    "Tehri Garhwal",
    "Udham Singh Nagar",
    "Uttarkashi"
  ],
  "West Bengal": [
    "Alipurduar",
    "Bankura",
    "Barddhaman",
    "Birbhum",
    "Dakshin Dinajpur",
    "Darjiling",
    "Haora",
    "Hugli",
    "Jalpaiguri",
    "Jhargram",
    "Kalimpong",
    "Koch Bihar",
    "Kolkata",
    "Maldah",
    "Murshidabad",
    "Nadia",
    "North Twenty Four Parganas",
    "Paschim Bardhaman",
    "Paschim Medinipur",
    "Purba Bardhaman",
    "Purba Medinipur",
    "Puruliya",
    "South Twenty Four Parganas",
    "Uttar Dinajpur"
  ]
};

const ALL_DISTRICTS_WITH_STATE: Array<{ district: string; state: string }> = [
  {
    "district": "Nicobars",
    "state": "Andaman & Nicobar Islands"
  },
  {
    "district": "North and Middle Andaman",
    "state": "Andaman & Nicobar Islands"
  },
  {
    "district": "South Andaman",
    "state": "Andaman & Nicobar Islands"
  },
  {
    "district": "Anantapur",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Chittoor",
    "state": "Andhra Pradesh"
  },
  {
    "district": "East Godavari",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Guntur",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Krishna",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Kurnool",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Prakasam",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Sri Potti Sriramulu Nellore",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Srikakulam",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Visakhapatnam",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Vizianagaram",
    "state": "Andhra Pradesh"
  },
  {
    "district": "West Godavari",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Y.S.R.",
    "state": "Andhra Pradesh"
  },
  {
    "district": "Anjaw",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Changlang",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Dibang Valley",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "East Kameng",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "East Siang",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Kra Daadi",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Kurung Kumey",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Lohit",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Lower Dibang Valley",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Lower Siang",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Lower Subansiri",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Namsai",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Papum Pare",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Siang",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Tawang",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Tirap",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Upper Siang",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Upper Subansiri",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "West Kameng",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "West Siang",
    "state": "Arunachal Pradesh"
  },
  {
    "district": "Baksa",
    "state": "Assam"
  },
  {
    "district": "Barpeta",
    "state": "Assam"
  },
  {
    "district": "Biswanath",
    "state": "Assam"
  },
  {
    "district": "Bongaigaon",
    "state": "Assam"
  },
  {
    "district": "Cachar",
    "state": "Assam"
  },
  {
    "district": "Charaideo",
    "state": "Assam"
  },
  {
    "district": "Chirang",
    "state": "Assam"
  },
  {
    "district": "Darrang",
    "state": "Assam"
  },
  {
    "district": "Dhemaji",
    "state": "Assam"
  },
  {
    "district": "Dhubri",
    "state": "Assam"
  },
  {
    "district": "Dibrugarh",
    "state": "Assam"
  },
  {
    "district": "Dima Hasao",
    "state": "Assam"
  },
  {
    "district": "Goalpara",
    "state": "Assam"
  },
  {
    "district": "Golaghat",
    "state": "Assam"
  },
  {
    "district": "Hailakandi",
    "state": "Assam"
  },
  {
    "district": "Hojai",
    "state": "Assam"
  },
  {
    "district": "Jorhat",
    "state": "Assam"
  },
  {
    "district": "Kamrup",
    "state": "Assam"
  },
  {
    "district": "Kamrup Metropolitan",
    "state": "Assam"
  },
  {
    "district": "Karbi Anglong",
    "state": "Assam"
  },
  {
    "district": "Karimganj",
    "state": "Assam"
  },
  {
    "district": "Kokrajhar",
    "state": "Assam"
  },
  {
    "district": "Lakhimpur",
    "state": "Assam"
  },
  {
    "district": "Majuli",
    "state": "Assam"
  },
  {
    "district": "Morigaon",
    "state": "Assam"
  },
  {
    "district": "Nagaon",
    "state": "Assam"
  },
  {
    "district": "Nalbari",
    "state": "Assam"
  },
  {
    "district": "Sivasagar",
    "state": "Assam"
  },
  {
    "district": "Sonitpur",
    "state": "Assam"
  },
  {
    "district": "South Salamara-Mankachar",
    "state": "Assam"
  },
  {
    "district": "Tinsukia",
    "state": "Assam"
  },
  {
    "district": "Udalguri",
    "state": "Assam"
  },
  {
    "district": "West Karbi Anglong",
    "state": "Assam"
  },
  {
    "district": "Araria",
    "state": "Bihar"
  },
  {
    "district": "Arwal",
    "state": "Bihar"
  },
  {
    "district": "Aurangabad",
    "state": "Bihar"
  },
  {
    "district": "Banka",
    "state": "Bihar"
  },
  {
    "district": "Begusarai",
    "state": "Bihar"
  },
  {
    "district": "Bhagalpur",
    "state": "Bihar"
  },
  {
    "district": "Bhojpur",
    "state": "Bihar"
  },
  {
    "district": "Buxar",
    "state": "Bihar"
  },
  {
    "district": "Darbhanga",
    "state": "Bihar"
  },
  {
    "district": "Gaya",
    "state": "Bihar"
  },
  {
    "district": "Gopalganj",
    "state": "Bihar"
  },
  {
    "district": "Jamui",
    "state": "Bihar"
  },
  {
    "district": "Jehanabad",
    "state": "Bihar"
  },
  {
    "district": "Kaimur (Bhabua)",
    "state": "Bihar"
  },
  {
    "district": "Katihar",
    "state": "Bihar"
  },
  {
    "district": "Khagaria",
    "state": "Bihar"
  },
  {
    "district": "Kishanganj",
    "state": "Bihar"
  },
  {
    "district": "Lakhisarai",
    "state": "Bihar"
  },
  {
    "district": "Madhepura",
    "state": "Bihar"
  },
  {
    "district": "Madhubani",
    "state": "Bihar"
  },
  {
    "district": "Munger",
    "state": "Bihar"
  },
  {
    "district": "Muzaffarpur",
    "state": "Bihar"
  },
  {
    "district": "Nalanda",
    "state": "Bihar"
  },
  {
    "district": "Nawada",
    "state": "Bihar"
  },
  {
    "district": "Pashchim Champaran",
    "state": "Bihar"
  },
  {
    "district": "Patna",
    "state": "Bihar"
  },
  {
    "district": "Purbi Champaran",
    "state": "Bihar"
  },
  {
    "district": "Purnia",
    "state": "Bihar"
  },
  {
    "district": "Rohtas",
    "state": "Bihar"
  },
  {
    "district": "Saharsa",
    "state": "Bihar"
  },
  {
    "district": "Samastipur",
    "state": "Bihar"
  },
  {
    "district": "Saran",
    "state": "Bihar"
  },
  {
    "district": "Sheikhpura",
    "state": "Bihar"
  },
  {
    "district": "Sheohar",
    "state": "Bihar"
  },
  {
    "district": "Sitamarhi",
    "state": "Bihar"
  },
  {
    "district": "Siwan",
    "state": "Bihar"
  },
  {
    "district": "Supaul",
    "state": "Bihar"
  },
  {
    "district": "Vaishali",
    "state": "Bihar"
  },
  {
    "district": "Chandigarh",
    "state": "Chandigarh"
  },
  {
    "district": "Balod",
    "state": "Chhattisgarh"
  },
  {
    "district": "Baloda Bazar",
    "state": "Chhattisgarh"
  },
  {
    "district": "Balrampur",
    "state": "Chhattisgarh"
  },
  {
    "district": "Bastar",
    "state": "Chhattisgarh"
  },
  {
    "district": "Bemetara",
    "state": "Chhattisgarh"
  },
  {
    "district": "Bijapur",
    "state": "Chhattisgarh"
  },
  {
    "district": "Bilaspur",
    "state": "Chhattisgarh"
  },
  {
    "district": "Dakshin Bastar Dantewada",
    "state": "Chhattisgarh"
  },
  {
    "district": "Dhamtari",
    "state": "Chhattisgarh"
  },
  {
    "district": "Durg",
    "state": "Chhattisgarh"
  },
  {
    "district": "Gariyaband",
    "state": "Chhattisgarh"
  },
  {
    "district": "Janjgir - Champa",
    "state": "Chhattisgarh"
  },
  {
    "district": "Jashpur",
    "state": "Chhattisgarh"
  },
  {
    "district": "Kabeerdham",
    "state": "Chhattisgarh"
  },
  {
    "district": "Kondagaon",
    "state": "Chhattisgarh"
  },
  {
    "district": "Korba",
    "state": "Chhattisgarh"
  },
  {
    "district": "Koriya",
    "state": "Chhattisgarh"
  },
  {
    "district": "Mahasamund",
    "state": "Chhattisgarh"
  },
  {
    "district": "Mungeli",
    "state": "Chhattisgarh"
  },
  {
    "district": "Narayanpur",
    "state": "Chhattisgarh"
  },
  {
    "district": "Raigarh",
    "state": "Chhattisgarh"
  },
  {
    "district": "Raipur",
    "state": "Chhattisgarh"
  },
  {
    "district": "Rajnandgaon",
    "state": "Chhattisgarh"
  },
  {
    "district": "Sukma",
    "state": "Chhattisgarh"
  },
  {
    "district": "Surajpur",
    "state": "Chhattisgarh"
  },
  {
    "district": "Surguja",
    "state": "Chhattisgarh"
  },
  {
    "district": "Uttar Bastar Kanker",
    "state": "Chhattisgarh"
  },
  {
    "district": "Dadra and Nagar Haveli",
    "state": "Dadra & Nagar Haveli"
  },
  {
    "district": "Daman",
    "state": "Daman and Diu"
  },
  {
    "district": "Diu",
    "state": "Daman and Diu"
  },
  {
    "district": "North Goa",
    "state": "Goa"
  },
  {
    "district": "South Goa",
    "state": "Goa"
  },
  {
    "district": "Ahmadabad",
    "state": "Gujarat"
  },
  {
    "district": "Amreli",
    "state": "Gujarat"
  },
  {
    "district": "Anand",
    "state": "Gujarat"
  },
  {
    "district": "Arvalli",
    "state": "Gujarat"
  },
  {
    "district": "Banas Kantha",
    "state": "Gujarat"
  },
  {
    "district": "Bharuch",
    "state": "Gujarat"
  },
  {
    "district": "Bhavnagar",
    "state": "Gujarat"
  },
  {
    "district": "Botad",
    "state": "Gujarat"
  },
  {
    "district": "Chhota Udepur",
    "state": "Gujarat"
  },
  {
    "district": "Devbhoomi Dwarka",
    "state": "Gujarat"
  },
  {
    "district": "Dohad",
    "state": "Gujarat"
  },
  {
    "district": "Gandhinagar",
    "state": "Gujarat"
  },
  {
    "district": "Gir Somnath",
    "state": "Gujarat"
  },
  {
    "district": "Jamnagar",
    "state": "Gujarat"
  },
  {
    "district": "Junagadh",
    "state": "Gujarat"
  },
  {
    "district": "Kachchh",
    "state": "Gujarat"
  },
  {
    "district": "Kheda",
    "state": "Gujarat"
  },
  {
    "district": "Mahesana",
    "state": "Gujarat"
  },
  {
    "district": "Mahisagar",
    "state": "Gujarat"
  },
  {
    "district": "Morbi",
    "state": "Gujarat"
  },
  {
    "district": "Narmada",
    "state": "Gujarat"
  },
  {
    "district": "Navsari",
    "state": "Gujarat"
  },
  {
    "district": "Panch Mahals",
    "state": "Gujarat"
  },
  {
    "district": "Patan",
    "state": "Gujarat"
  },
  {
    "district": "Porbandar",
    "state": "Gujarat"
  },
  {
    "district": "Rajkot",
    "state": "Gujarat"
  },
  {
    "district": "Sabar Kantha",
    "state": "Gujarat"
  },
  {
    "district": "Surat",
    "state": "Gujarat"
  },
  {
    "district": "Surendranagar",
    "state": "Gujarat"
  },
  {
    "district": "Tapi",
    "state": "Gujarat"
  },
  {
    "district": "The Dangs",
    "state": "Gujarat"
  },
  {
    "district": "Vadodara",
    "state": "Gujarat"
  },
  {
    "district": "Valsad",
    "state": "Gujarat"
  },
  {
    "district": "Ambala",
    "state": "Haryana"
  },
  {
    "district": "Bhiwani",
    "state": "Haryana"
  },
  {
    "district": "Charkhi Dadri",
    "state": "Haryana"
  },
  {
    "district": "Faridabad",
    "state": "Haryana"
  },
  {
    "district": "Fatehabad",
    "state": "Haryana"
  },
  {
    "district": "Gurgaon",
    "state": "Haryana"
  },
  {
    "district": "Hisar",
    "state": "Haryana"
  },
  {
    "district": "Jhajjar",
    "state": "Haryana"
  },
  {
    "district": "Jind",
    "state": "Haryana"
  },
  {
    "district": "Kaithal",
    "state": "Haryana"
  },
  {
    "district": "Karnal",
    "state": "Haryana"
  },
  {
    "district": "Kurukshetra",
    "state": "Haryana"
  },
  {
    "district": "Mahendragarh",
    "state": "Haryana"
  },
  {
    "district": "Mewat",
    "state": "Haryana"
  },
  {
    "district": "Palwal",
    "state": "Haryana"
  },
  {
    "district": "Panchkula",
    "state": "Haryana"
  },
  {
    "district": "Panipat",
    "state": "Haryana"
  },
  {
    "district": "Rewari",
    "state": "Haryana"
  },
  {
    "district": "Rohtak",
    "state": "Haryana"
  },
  {
    "district": "Sirsa",
    "state": "Haryana"
  },
  {
    "district": "Sonipat",
    "state": "Haryana"
  },
  {
    "district": "Yamunanagar",
    "state": "Haryana"
  },
  {
    "district": "Bilaspur",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Chamba",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Hamirpur",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Kangra",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Kinnaur",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Kullu",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Lahul Spiti",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Mandi",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Shimla",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Sirmaur",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Solan",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Una",
    "state": "Himachal Pradesh"
  },
  {
    "district": "Anantnag",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Badgam",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Bandipore",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Baramula",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Doda",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Ganderbal",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Jammu",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Kargil",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Kathua",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Kishtwar",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Kulgam",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Kupwara",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Leh(Ladakh)",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Pulwama",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Punch",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Rajouri",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Ramban",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Reasi",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Samba",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Shupiyan",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Srinagar",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Udhampur",
    "state": "Jammu and Kashmir"
  },
  {
    "district": "Bokaro",
    "state": "Jharkhand"
  },
  {
    "district": "Chatra",
    "state": "Jharkhand"
  },
  {
    "district": "Deoghar",
    "state": "Jharkhand"
  },
  {
    "district": "Dhanbad",
    "state": "Jharkhand"
  },
  {
    "district": "Dumka",
    "state": "Jharkhand"
  },
  {
    "district": "Garhwa",
    "state": "Jharkhand"
  },
  {
    "district": "Giridih",
    "state": "Jharkhand"
  },
  {
    "district": "Godda",
    "state": "Jharkhand"
  },
  {
    "district": "Gumla",
    "state": "Jharkhand"
  },
  {
    "district": "Hazaribagh",
    "state": "Jharkhand"
  },
  {
    "district": "Jamtara",
    "state": "Jharkhand"
  },
  {
    "district": "Khunti",
    "state": "Jharkhand"
  },
  {
    "district": "Kodarma",
    "state": "Jharkhand"
  },
  {
    "district": "Latehar",
    "state": "Jharkhand"
  },
  {
    "district": "Lohardaga",
    "state": "Jharkhand"
  },
  {
    "district": "Pakur",
    "state": "Jharkhand"
  },
  {
    "district": "Palamu",
    "state": "Jharkhand"
  },
  {
    "district": "Pashchimi Singhbhum",
    "state": "Jharkhand"
  },
  {
    "district": "Purbi Singhbhum",
    "state": "Jharkhand"
  },
  {
    "district": "Ramgarh",
    "state": "Jharkhand"
  },
  {
    "district": "Ranchi",
    "state": "Jharkhand"
  },
  {
    "district": "Sahibganj",
    "state": "Jharkhand"
  },
  {
    "district": "Saraikela-Kharsawan",
    "state": "Jharkhand"
  },
  {
    "district": "Simdega",
    "state": "Jharkhand"
  },
  {
    "district": "Bagalkot",
    "state": "Karnataka"
  },
  {
    "district": "Bangalore",
    "state": "Karnataka"
  },
  {
    "district": "Bangalore Rural",
    "state": "Karnataka"
  },
  {
    "district": "Belgaum",
    "state": "Karnataka"
  },
  {
    "district": "Bellary",
    "state": "Karnataka"
  },
  {
    "district": "Bidar",
    "state": "Karnataka"
  },
  {
    "district": "Bijapur",
    "state": "Karnataka"
  },
  {
    "district": "Chamarajanagar",
    "state": "Karnataka"
  },
  {
    "district": "Chikkaballapura",
    "state": "Karnataka"
  },
  {
    "district": "Chikmagalur",
    "state": "Karnataka"
  },
  {
    "district": "Chitradurga",
    "state": "Karnataka"
  },
  {
    "district": "Dakshina Kannada",
    "state": "Karnataka"
  },
  {
    "district": "Davanagere",
    "state": "Karnataka"
  },
  {
    "district": "Dharwad",
    "state": "Karnataka"
  },
  {
    "district": "Gadag",
    "state": "Karnataka"
  },
  {
    "district": "Gulbarga",
    "state": "Karnataka"
  },
  {
    "district": "Hassan",
    "state": "Karnataka"
  },
  {
    "district": "Haveri",
    "state": "Karnataka"
  },
  {
    "district": "Kodagu",
    "state": "Karnataka"
  },
  {
    "district": "Kolar",
    "state": "Karnataka"
  },
  {
    "district": "Koppal",
    "state": "Karnataka"
  },
  {
    "district": "Mandya",
    "state": "Karnataka"
  },
  {
    "district": "Mysore",
    "state": "Karnataka"
  },
  {
    "district": "Raichur",
    "state": "Karnataka"
  },
  {
    "district": "Ramanagara",
    "state": "Karnataka"
  },
  {
    "district": "Shimoga",
    "state": "Karnataka"
  },
  {
    "district": "Tumkur",
    "state": "Karnataka"
  },
  {
    "district": "Udupi",
    "state": "Karnataka"
  },
  {
    "district": "Uttara Kannada",
    "state": "Karnataka"
  },
  {
    "district": "Yadgir",
    "state": "Karnataka"
  },
  {
    "district": "Alappuzha",
    "state": "Kerala"
  },
  {
    "district": "Ernakulam",
    "state": "Kerala"
  },
  {
    "district": "Idukki",
    "state": "Kerala"
  },
  {
    "district": "Kannur",
    "state": "Kerala"
  },
  {
    "district": "Kasaragod",
    "state": "Kerala"
  },
  {
    "district": "Kollam",
    "state": "Kerala"
  },
  {
    "district": "Kottayam",
    "state": "Kerala"
  },
  {
    "district": "Kozhikode",
    "state": "Kerala"
  },
  {
    "district": "Malappuram",
    "state": "Kerala"
  },
  {
    "district": "Palakkad",
    "state": "Kerala"
  },
  {
    "district": "Pathanamthitta",
    "state": "Kerala"
  },
  {
    "district": "Thiruvananthapuram",
    "state": "Kerala"
  },
  {
    "district": "Thrissur",
    "state": "Kerala"
  },
  {
    "district": "Wayanad",
    "state": "Kerala"
  },
  {
    "district": "Lakshadweep",
    "state": "Lakshadweep"
  },
  {
    "district": "Agar Malwa",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Alirajpur",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Anuppur",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Ashoknagar",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Balaghat",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Barwani",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Betul",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Bhind",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Bhopal",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Burhanpur",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Chhatarpur",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Chhindwara",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Damoh",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Datia",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Dewas",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Dhar",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Dindori",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Guna",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Gwalior",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Harda",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Hoshangabad",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Indore",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Jabalpur",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Jhabua",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Katni",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Khandwa (East Nimar)",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Khargone (West Nimar)",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Mandla",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Mandsaur",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Morena",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Narsimhapur",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Neemuch",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Panna",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Raisen",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Rajgarh",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Ratlam",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Rewa",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Sagar",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Satna",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Sehore",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Seoni",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Shahdol",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Shajapur",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Sheopur",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Shivpuri",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Sidhi",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Singrauli",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Tikamgarh",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Ujjain",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Umaria",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Vidisha",
    "state": "Madhya Pradesh"
  },
  {
    "district": "Ahmadnagar",
    "state": "Maharashtra"
  },
  {
    "district": "Akola",
    "state": "Maharashtra"
  },
  {
    "district": "Amravati",
    "state": "Maharashtra"
  },
  {
    "district": "Aurangabad",
    "state": "Maharashtra"
  },
  {
    "district": "Bhandara",
    "state": "Maharashtra"
  },
  {
    "district": "Bid",
    "state": "Maharashtra"
  },
  {
    "district": "Buldana",
    "state": "Maharashtra"
  },
  {
    "district": "Chandrapur",
    "state": "Maharashtra"
  },
  {
    "district": "Dhule",
    "state": "Maharashtra"
  },
  {
    "district": "Gadchiroli",
    "state": "Maharashtra"
  },
  {
    "district": "Gondiya",
    "state": "Maharashtra"
  },
  {
    "district": "Hingoli",
    "state": "Maharashtra"
  },
  {
    "district": "Jalgaon",
    "state": "Maharashtra"
  },
  {
    "district": "Jalna",
    "state": "Maharashtra"
  },
  {
    "district": "Kolhapur",
    "state": "Maharashtra"
  },
  {
    "district": "Latur",
    "state": "Maharashtra"
  },
  {
    "district": "Mumbai",
    "state": "Maharashtra"
  },
  {
    "district": "Mumbai Suburban",
    "state": "Maharashtra"
  },
  {
    "district": "Nagpur",
    "state": "Maharashtra"
  },
  {
    "district": "Nanded",
    "state": "Maharashtra"
  },
  {
    "district": "Nandurbar",
    "state": "Maharashtra"
  },
  {
    "district": "Nashik",
    "state": "Maharashtra"
  },
  {
    "district": "Osmanabad",
    "state": "Maharashtra"
  },
  {
    "district": "Palghar",
    "state": "Maharashtra"
  },
  {
    "district": "Parbhani",
    "state": "Maharashtra"
  },
  {
    "district": "Pune",
    "state": "Maharashtra"
  },
  {
    "district": "Raigarh",
    "state": "Maharashtra"
  },
  {
    "district": "Ratnagiri",
    "state": "Maharashtra"
  },
  {
    "district": "Sangli",
    "state": "Maharashtra"
  },
  {
    "district": "Satara",
    "state": "Maharashtra"
  },
  {
    "district": "Sindhudurg",
    "state": "Maharashtra"
  },
  {
    "district": "Solapur",
    "state": "Maharashtra"
  },
  {
    "district": "Thane",
    "state": "Maharashtra"
  },
  {
    "district": "Wardha",
    "state": "Maharashtra"
  },
  {
    "district": "Washim",
    "state": "Maharashtra"
  },
  {
    "district": "Yavatmal",
    "state": "Maharashtra"
  },
  {
    "district": "Bishnupur",
    "state": "Manipur"
  },
  {
    "district": "Chandel",
    "state": "Manipur"
  },
  {
    "district": "Churachandpur",
    "state": "Manipur"
  },
  {
    "district": "Imphal East",
    "state": "Manipur"
  },
  {
    "district": "Imphal West",
    "state": "Manipur"
  },
  {
    "district": "Jiribam",
    "state": "Manipur"
  },
  {
    "district": "Kakching",
    "state": "Manipur"
  },
  {
    "district": "Kamjong",
    "state": "Manipur"
  },
  {
    "district": "Kangpokpi",
    "state": "Manipur"
  },
  {
    "district": "Noney",
    "state": "Manipur"
  },
  {
    "district": "Pherzawl",
    "state": "Manipur"
  },
  {
    "district": "Senapati",
    "state": "Manipur"
  },
  {
    "district": "Tamenglong",
    "state": "Manipur"
  },
  {
    "district": "Tengnoupal",
    "state": "Manipur"
  },
  {
    "district": "Thoubal",
    "state": "Manipur"
  },
  {
    "district": "Ukhrul",
    "state": "Manipur"
  },
  {
    "district": "East Garo Hills",
    "state": "Meghalaya"
  },
  {
    "district": "East Jaintia Hills",
    "state": "Meghalaya"
  },
  {
    "district": "East Khasi Hills",
    "state": "Meghalaya"
  },
  {
    "district": "Jaintia Hills",
    "state": "Meghalaya"
  },
  {
    "district": "North Garo Hills",
    "state": "Meghalaya"
  },
  {
    "district": "Ribhoi",
    "state": "Meghalaya"
  },
  {
    "district": "South Garo Hills",
    "state": "Meghalaya"
  },
  {
    "district": "South West Garo Hills",
    "state": "Meghalaya"
  },
  {
    "district": "South West Khasi Hills",
    "state": "Meghalaya"
  },
  {
    "district": "West Garo Hills",
    "state": "Meghalaya"
  },
  {
    "district": "West Jaintia Hills",
    "state": "Meghalaya"
  },
  {
    "district": "West Khasi Hills",
    "state": "Meghalaya"
  },
  {
    "district": "Aizawl",
    "state": "Mizoram"
  },
  {
    "district": "Champhai",
    "state": "Mizoram"
  },
  {
    "district": "Kolasib",
    "state": "Mizoram"
  },
  {
    "district": "Lawngtlai",
    "state": "Mizoram"
  },
  {
    "district": "Lunglei",
    "state": "Mizoram"
  },
  {
    "district": "Mamit",
    "state": "Mizoram"
  },
  {
    "district": "Saiha",
    "state": "Mizoram"
  },
  {
    "district": "Serchhip",
    "state": "Mizoram"
  },
  {
    "district": "Dimapur",
    "state": "Nagaland"
  },
  {
    "district": "Kiphire",
    "state": "Nagaland"
  },
  {
    "district": "Kohima",
    "state": "Nagaland"
  },
  {
    "district": "Longleng",
    "state": "Nagaland"
  },
  {
    "district": "Mokokchung",
    "state": "Nagaland"
  },
  {
    "district": "Mon",
    "state": "Nagaland"
  },
  {
    "district": "Peren",
    "state": "Nagaland"
  },
  {
    "district": "Phek",
    "state": "Nagaland"
  },
  {
    "district": "Tuensang",
    "state": "Nagaland"
  },
  {
    "district": "Wokha",
    "state": "Nagaland"
  },
  {
    "district": "Zunheboto",
    "state": "Nagaland"
  },
  {
    "district": "Central",
    "state": "Nct of Delhi"
  },
  {
    "district": "East",
    "state": "Nct of Delhi"
  },
  {
    "district": "New Delhi",
    "state": "Nct of Delhi"
  },
  {
    "district": "North",
    "state": "Nct of Delhi"
  },
  {
    "district": "North East",
    "state": "Nct of Delhi"
  },
  {
    "district": "North West",
    "state": "Nct of Delhi"
  },
  {
    "district": "Shahdara",
    "state": "Nct of Delhi"
  },
  {
    "district": "South",
    "state": "Nct of Delhi"
  },
  {
    "district": "South East Delhi",
    "state": "Nct of Delhi"
  },
  {
    "district": "South West",
    "state": "Nct of Delhi"
  },
  {
    "district": "West",
    "state": "Nct of Delhi"
  },
  {
    "district": "Anugul",
    "state": "Odisha"
  },
  {
    "district": "Balangir",
    "state": "Odisha"
  },
  {
    "district": "Baleshwar",
    "state": "Odisha"
  },
  {
    "district": "Bargarh",
    "state": "Odisha"
  },
  {
    "district": "Baudh",
    "state": "Odisha"
  },
  {
    "district": "Bhadrak",
    "state": "Odisha"
  },
  {
    "district": "Cuttack",
    "state": "Odisha"
  },
  {
    "district": "Debagarh",
    "state": "Odisha"
  },
  {
    "district": "Dhenkanal",
    "state": "Odisha"
  },
  {
    "district": "Gajapati",
    "state": "Odisha"
  },
  {
    "district": "Ganjam",
    "state": "Odisha"
  },
  {
    "district": "Jagatsinghapur",
    "state": "Odisha"
  },
  {
    "district": "Jajapur",
    "state": "Odisha"
  },
  {
    "district": "Jharsuguda",
    "state": "Odisha"
  },
  {
    "district": "Kalahandi",
    "state": "Odisha"
  },
  {
    "district": "Kandhamal",
    "state": "Odisha"
  },
  {
    "district": "Kendrapara",
    "state": "Odisha"
  },
  {
    "district": "Kendujhar",
    "state": "Odisha"
  },
  {
    "district": "Khordha",
    "state": "Odisha"
  },
  {
    "district": "Koraput",
    "state": "Odisha"
  },
  {
    "district": "Malkangiri",
    "state": "Odisha"
  },
  {
    "district": "Mayurbhanj",
    "state": "Odisha"
  },
  {
    "district": "Nabarangapur",
    "state": "Odisha"
  },
  {
    "district": "Nayagarh",
    "state": "Odisha"
  },
  {
    "district": "Nuapada",
    "state": "Odisha"
  },
  {
    "district": "Puri",
    "state": "Odisha"
  },
  {
    "district": "Rayagada",
    "state": "Odisha"
  },
  {
    "district": "Sambalpur",
    "state": "Odisha"
  },
  {
    "district": "Subarnapur",
    "state": "Odisha"
  },
  {
    "district": "Sundargarh",
    "state": "Odisha"
  },
  {
    "district": "Karaikal",
    "state": "Puducherry"
  },
  {
    "district": "Mahe",
    "state": "Puducherry"
  },
  {
    "district": "Puducherry",
    "state": "Puducherry"
  },
  {
    "district": "Yanam",
    "state": "Puducherry"
  },
  {
    "district": "Amritsar",
    "state": "Punjab"
  },
  {
    "district": "Barnala",
    "state": "Punjab"
  },
  {
    "district": "Bathinda",
    "state": "Punjab"
  },
  {
    "district": "Faridkot",
    "state": "Punjab"
  },
  {
    "district": "Fatehgarh Sahib",
    "state": "Punjab"
  },
  {
    "district": "Fazilka",
    "state": "Punjab"
  },
  {
    "district": "Firozpur",
    "state": "Punjab"
  },
  {
    "district": "Gurdaspur",
    "state": "Punjab"
  },
  {
    "district": "Hoshiarpur",
    "state": "Punjab"
  },
  {
    "district": "Jalandhar",
    "state": "Punjab"
  },
  {
    "district": "Kapurthala",
    "state": "Punjab"
  },
  {
    "district": "Ludhiana",
    "state": "Punjab"
  },
  {
    "district": "Mansa",
    "state": "Punjab"
  },
  {
    "district": "Moga",
    "state": "Punjab"
  },
  {
    "district": "Muktsar",
    "state": "Punjab"
  },
  {
    "district": "Pathankot",
    "state": "Punjab"
  },
  {
    "district": "Patiala",
    "state": "Punjab"
  },
  {
    "district": "Rupnagar",
    "state": "Punjab"
  },
  {
    "district": "Sahibzada Ajit Singh Nagar",
    "state": "Punjab"
  },
  {
    "district": "Sangrur",
    "state": "Punjab"
  },
  {
    "district": "Shahid Bhagat Singh Nagar",
    "state": "Punjab"
  },
  {
    "district": "Tarn Taran",
    "state": "Punjab"
  },
  {
    "district": "Ajmer",
    "state": "Rajasthan"
  },
  {
    "district": "Alwar",
    "state": "Rajasthan"
  },
  {
    "district": "Banswara",
    "state": "Rajasthan"
  },
  {
    "district": "Baran",
    "state": "Rajasthan"
  },
  {
    "district": "Barmer",
    "state": "Rajasthan"
  },
  {
    "district": "Bharatpur",
    "state": "Rajasthan"
  },
  {
    "district": "Bhilwara",
    "state": "Rajasthan"
  },
  {
    "district": "Bikaner",
    "state": "Rajasthan"
  },
  {
    "district": "Bundi",
    "state": "Rajasthan"
  },
  {
    "district": "Chittaurgarh",
    "state": "Rajasthan"
  },
  {
    "district": "Churu",
    "state": "Rajasthan"
  },
  {
    "district": "Dausa",
    "state": "Rajasthan"
  },
  {
    "district": "Dhaulpur",
    "state": "Rajasthan"
  },
  {
    "district": "Dungarpur",
    "state": "Rajasthan"
  },
  {
    "district": "Hanumangarh",
    "state": "Rajasthan"
  },
  {
    "district": "Jaipur",
    "state": "Rajasthan"
  },
  {
    "district": "Jaisalmer",
    "state": "Rajasthan"
  },
  {
    "district": "Jalor",
    "state": "Rajasthan"
  },
  {
    "district": "Jhalawar",
    "state": "Rajasthan"
  },
  {
    "district": "Jhunjhunun",
    "state": "Rajasthan"
  },
  {
    "district": "Jodhpur",
    "state": "Rajasthan"
  },
  {
    "district": "Karauli",
    "state": "Rajasthan"
  },
  {
    "district": "Kota",
    "state": "Rajasthan"
  },
  {
    "district": "Nagaur",
    "state": "Rajasthan"
  },
  {
    "district": "Pali",
    "state": "Rajasthan"
  },
  {
    "district": "Pratapgarh",
    "state": "Rajasthan"
  },
  {
    "district": "Rajsamand",
    "state": "Rajasthan"
  },
  {
    "district": "Sawai Madhopur",
    "state": "Rajasthan"
  },
  {
    "district": "Sikar",
    "state": "Rajasthan"
  },
  {
    "district": "Sirohi",
    "state": "Rajasthan"
  },
  {
    "district": "Sri Ganganagar",
    "state": "Rajasthan"
  },
  {
    "district": "Tonk",
    "state": "Rajasthan"
  },
  {
    "district": "Udaipur",
    "state": "Rajasthan"
  },
  {
    "district": "East District",
    "state": "Sikkim"
  },
  {
    "district": "North  District",
    "state": "Sikkim"
  },
  {
    "district": "South District",
    "state": "Sikkim"
  },
  {
    "district": "West District",
    "state": "Sikkim"
  },
  {
    "district": "Ariyalur",
    "state": "Tamil Nadu"
  },
  {
    "district": "Chennai",
    "state": "Tamil Nadu"
  },
  {
    "district": "Coimbatore",
    "state": "Tamil Nadu"
  },
  {
    "district": "Cuddalore",
    "state": "Tamil Nadu"
  },
  {
    "district": "Dharmapuri",
    "state": "Tamil Nadu"
  },
  {
    "district": "Dindigul",
    "state": "Tamil Nadu"
  },
  {
    "district": "Erode",
    "state": "Tamil Nadu"
  },
  {
    "district": "Kancheepuram",
    "state": "Tamil Nadu"
  },
  {
    "district": "Kanniyakumari",
    "state": "Tamil Nadu"
  },
  {
    "district": "Karur",
    "state": "Tamil Nadu"
  },
  {
    "district": "Krishnagiri",
    "state": "Tamil Nadu"
  },
  {
    "district": "Madurai",
    "state": "Tamil Nadu"
  },
  {
    "district": "Nagapattinam",
    "state": "Tamil Nadu"
  },
  {
    "district": "Namakkal",
    "state": "Tamil Nadu"
  },
  {
    "district": "Perambalur",
    "state": "Tamil Nadu"
  },
  {
    "district": "Pudukkottai",
    "state": "Tamil Nadu"
  },
  {
    "district": "Ramanathapuram",
    "state": "Tamil Nadu"
  },
  {
    "district": "Salem",
    "state": "Tamil Nadu"
  },
  {
    "district": "Sivaganga",
    "state": "Tamil Nadu"
  },
  {
    "district": "Thanjavur",
    "state": "Tamil Nadu"
  },
  {
    "district": "The Nilgiris",
    "state": "Tamil Nadu"
  },
  {
    "district": "Theni",
    "state": "Tamil Nadu"
  },
  {
    "district": "Thiruvallur",
    "state": "Tamil Nadu"
  },
  {
    "district": "Thiruvarur",
    "state": "Tamil Nadu"
  },
  {
    "district": "Thoothukkudi",
    "state": "Tamil Nadu"
  },
  {
    "district": "Tiruchirappalli",
    "state": "Tamil Nadu"
  },
  {
    "district": "Tirunelveli",
    "state": "Tamil Nadu"
  },
  {
    "district": "Tiruppur",
    "state": "Tamil Nadu"
  },
  {
    "district": "Tiruvannamalai",
    "state": "Tamil Nadu"
  },
  {
    "district": "Vellore",
    "state": "Tamil Nadu"
  },
  {
    "district": "Viluppuram",
    "state": "Tamil Nadu"
  },
  {
    "district": "Virudhunagar",
    "state": "Tamil Nadu"
  },
  {
    "district": "Adilabad",
    "state": "Telangana"
  },
  {
    "district": "Bhadradri",
    "state": "Telangana"
  },
  {
    "district": "Hyderabad",
    "state": "Telangana"
  },
  {
    "district": "Jagtial",
    "state": "Telangana"
  },
  {
    "district": "Jangaon",
    "state": "Telangana"
  },
  {
    "district": "Jayashankar",
    "state": "Telangana"
  },
  {
    "district": "Jogulamba",
    "state": "Telangana"
  },
  {
    "district": "Kamareddy",
    "state": "Telangana"
  },
  {
    "district": "Karimnagar",
    "state": "Telangana"
  },
  {
    "district": "Khammam",
    "state": "Telangana"
  },
  {
    "district": "Komaram Bheem",
    "state": "Telangana"
  },
  {
    "district": "Mahabubabad",
    "state": "Telangana"
  },
  {
    "district": "Mahbubnagar",
    "state": "Telangana"
  },
  {
    "district": "Mancherial",
    "state": "Telangana"
  },
  {
    "district": "Medak",
    "state": "Telangana"
  },
  {
    "district": "Medchal-Malkajgiri",
    "state": "Telangana"
  },
  {
    "district": "Nagarkurnool",
    "state": "Telangana"
  },
  {
    "district": "Nalgonda",
    "state": "Telangana"
  },
  {
    "district": "Nirmal",
    "state": "Telangana"
  },
  {
    "district": "Nizamabad",
    "state": "Telangana"
  },
  {
    "district": "Peddapalli",
    "state": "Telangana"
  },
  {
    "district": "Rajanna",
    "state": "Telangana"
  },
  {
    "district": "Rangareddy",
    "state": "Telangana"
  },
  {
    "district": "Sangareddy",
    "state": "Telangana"
  },
  {
    "district": "Siddipet",
    "state": "Telangana"
  },
  {
    "district": "Suryapet",
    "state": "Telangana"
  },
  {
    "district": "Vikarabad",
    "state": "Telangana"
  },
  {
    "district": "Wanaparthy",
    "state": "Telangana"
  },
  {
    "district": "Warangal Rural",
    "state": "Telangana"
  },
  {
    "district": "Warangal Urban",
    "state": "Telangana"
  },
  {
    "district": "Yadadri",
    "state": "Telangana"
  },
  {
    "district": "Dhalai",
    "state": "Tripura"
  },
  {
    "district": "Gomati",
    "state": "Tripura"
  },
  {
    "district": "Khowai",
    "state": "Tripura"
  },
  {
    "district": "North Tripura",
    "state": "Tripura"
  },
  {
    "district": "Sepahijala",
    "state": "Tripura"
  },
  {
    "district": "South Tripura",
    "state": "Tripura"
  },
  {
    "district": "Unakoti",
    "state": "Tripura"
  },
  {
    "district": "West Tripura",
    "state": "Tripura"
  },
  {
    "district": "Agra",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Aligarh",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Allahabad",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Ambedkar Nagar",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Amethi",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Amroha",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Auraiya",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Azamgarh",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Baghpat",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Bahraich",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Ballia",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Balrampur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Banda",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Bara Banki",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Bareilly",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Basti",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Bhadohi",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Bijnor",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Budaun",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Bulandshahr",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Chandauli",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Chitrakoot",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Deoria",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Etah",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Etawah",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Faizabad",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Farrukhabad",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Fatehpur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Firozabad",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Gautam Buddha Nagar",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Ghaziabad",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Ghazipur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Gonda",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Gorakhpur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Hamirpur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Hapur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Hardoi",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Hathras",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Jalaun",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Jaunpur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Jhansi",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Kannauj",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Kanpur Dehat",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Kanpur Nagar",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Kasganj",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Kaushambi",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Kheri",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Kushinagar",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Lalitpur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Lucknow",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Mahoba",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Mahrajganj",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Mainpuri",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Mathura",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Mau",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Meerut",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Mirzapur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Moradabad",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Muzaffarnagar",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Pilibhit",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Pratapgarh",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Rae Bareli",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Rampur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Saharanpur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Sambhal",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Sant Kabir Nagar",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Shahjahanpur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Shamli",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Shrawasti",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Siddharthnagar",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Sitapur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Sonbhadra",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Sultanpur",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Unnao",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Varanasi",
    "state": "Uttar Pradesh"
  },
  {
    "district": "Almora",
    "state": "Uttarakhand"
  },
  {
    "district": "Bageshwar",
    "state": "Uttarakhand"
  },
  {
    "district": "Chamoli",
    "state": "Uttarakhand"
  },
  {
    "district": "Champawat",
    "state": "Uttarakhand"
  },
  {
    "district": "Dehradun",
    "state": "Uttarakhand"
  },
  {
    "district": "Garhwal",
    "state": "Uttarakhand"
  },
  {
    "district": "Hardwar",
    "state": "Uttarakhand"
  },
  {
    "district": "Nainital",
    "state": "Uttarakhand"
  },
  {
    "district": "Pithoragarh",
    "state": "Uttarakhand"
  },
  {
    "district": "Rudraprayag",
    "state": "Uttarakhand"
  },
  {
    "district": "Tehri Garhwal",
    "state": "Uttarakhand"
  },
  {
    "district": "Udham Singh Nagar",
    "state": "Uttarakhand"
  },
  {
    "district": "Uttarkashi",
    "state": "Uttarakhand"
  },
  {
    "district": "Alipurduar",
    "state": "West Bengal"
  },
  {
    "district": "Bankura",
    "state": "West Bengal"
  },
  {
    "district": "Barddhaman",
    "state": "West Bengal"
  },
  {
    "district": "Birbhum",
    "state": "West Bengal"
  },
  {
    "district": "Dakshin Dinajpur",
    "state": "West Bengal"
  },
  {
    "district": "Darjiling",
    "state": "West Bengal"
  },
  {
    "district": "Haora",
    "state": "West Bengal"
  },
  {
    "district": "Hugli",
    "state": "West Bengal"
  },
  {
    "district": "Jalpaiguri",
    "state": "West Bengal"
  },
  {
    "district": "Jhargram",
    "state": "West Bengal"
  },
  {
    "district": "Kalimpong",
    "state": "West Bengal"
  },
  {
    "district": "Koch Bihar",
    "state": "West Bengal"
  },
  {
    "district": "Kolkata",
    "state": "West Bengal"
  },
  {
    "district": "Maldah",
    "state": "West Bengal"
  },
  {
    "district": "Murshidabad",
    "state": "West Bengal"
  },
  {
    "district": "Nadia",
    "state": "West Bengal"
  },
  {
    "district": "North Twenty Four Parganas",
    "state": "West Bengal"
  },
  {
    "district": "Paschim Bardhaman",
    "state": "West Bengal"
  },
  {
    "district": "Paschim Medinipur",
    "state": "West Bengal"
  },
  {
    "district": "Purba Bardhaman",
    "state": "West Bengal"
  },
  {
    "district": "Purba Medinipur",
    "state": "West Bengal"
  },
  {
    "district": "Puruliya",
    "state": "West Bengal"
  },
  {
    "district": "South Twenty Four Parganas",
    "state": "West Bengal"
  },
  {
    "district": "Uttar Dinajpur",
    "state": "West Bengal"
  }
];

const getDistrictsForState = (stateName: string): string[] => {
  if (!stateName || stateName === 'all') return [];
  const match = Object.keys(STATE_DISTRICT_MAP).find(
    (s) => s.toLowerCase() === stateName.toLowerCase()
  );
  return match && STATE_DISTRICT_MAP[match] ? STATE_DISTRICT_MAP[match] : [];
};

const { height } = Dimensions.get('window');
const SHEET_COLLAPSED_HEIGHT = 185;
const SHEET_EXPANDED_HEIGHT = height * 0.62;
const DEFAULT_COORDINATE: [number, number] = [77.2650, 28.5355];

// Ensure MapLibre is initialized
try {
  MapLibreGL.setAccessToken(null);
} catch {
  // Ignore if already set
}

// Clean Minimalist Map Styles (Light & Dark)
const getCleanMapStyle = (isDark: boolean) => {
  const tileUrl = isDark
    ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
    : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';

  return JSON.stringify({
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        attribution: '© CARTO, © OpenStreetMap',
      },
    },
    layers: [
      {
        id: 'carto-tiles',
        type: 'raster',
        source: 'carto',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  });
};

// Filter Option Types
interface DropdownOption {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
}

const CPO_OPTIONS: DropdownOption[] = [
  { id: 'all', label: 'All CPO Networks', sublabel: 'Show stations from all operators', icon: '🌐' },
  { id: 'tata', label: 'Tata Power EZ Charge', sublabel: 'Pan-India fast charging network', icon: '🏢' },
  { id: 'jio', label: 'Jio-bp pulse', sublabel: 'High-speed highway & city hubs', icon: '🔵' },
  { id: 'statiq', label: 'Statiq Grid', sublabel: 'Commercial & mall charging hubs', icon: '⚡' },
  { id: 'chargezone', label: 'ChargeZone', sublabel: 'Dedicated inter-city EV corridors', icon: '🔋' },
  { id: 'ather', label: 'Ather Grid', sublabel: 'Fast 2W & public stations', icon: '🏍️' },
  { id: 'zeon', label: 'Zeon Charging', sublabel: 'Ultra-fast highway charging', icon: '⚡' },
];

const POWER_OPTIONS: DropdownOption[] = [
  { id: 'all', label: 'All Power Levels', sublabel: 'Any output capacity', icon: '⚡' },
  { id: 'ultra', label: '120+ kW (Ultra-Fast DC)', sublabel: '10-80% in under 25 mins', icon: '🚀' },
  { id: 'fast', label: '50 - 120 kW (DC Fast)', sublabel: 'Standard highway DC chargers', icon: '⚡' },
  { id: 'ac_fast', label: '22 kW (AC Fast)', sublabel: 'Destination & mall AC chargers', icon: '🔌' },
  { id: 'ac_normal', label: '3.3 - 7.4 kW (AC Normal)', sublabel: 'Overnight & slow chargers', icon: '🔌' },
];

const AVAILABILITY_OPTIONS: DropdownOption[] = [
  { id: 'all', label: 'All Availability Status', sublabel: 'Available, busy and in-use bays', icon: '🌐' },
  { id: 'available', label: 'Available Now Only', sublabel: 'At least 1 bay free right now', icon: '🟢' },
  { id: 'occupied', label: 'Currently In-Use / Busy', sublabel: 'All bays currently occupied', icon: '🔴' },
];

const CONNECTOR_OPTIONS: DropdownOption[] = [
  { id: 'all', label: 'All Connector Plugs', sublabel: 'CCS2, Type 2, CHAdeMO, GB/T', icon: '🔌' },
  { id: 'ccs2', label: 'CCS Type 2 (DC Fast)', sublabel: 'Tata, MG, Hyundai, Kia, BYD', icon: '⚡' },
  { id: 'type2', label: 'Type 2 AC (Mennekes)', sublabel: 'Standard Indian 4W AC socket', icon: '🔌' },
  { id: 'chademo', label: 'CHAdeMO (DC)', sublabel: 'Nissan, legacy Japanese EVs', icon: '⚡' },
  { id: 'gbt', label: 'GB/T (DC / AC)', sublabel: 'Fleet & commercial vehicles', icon: '🔌' },
];

type ActiveDropdownType = 'state' | 'district' | 'cpo' | 'power' | 'availability' | 'connector' | null;

interface MapScreenProps {
  navigation: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const { isCharging } = useCharging();
  const { mode, theme } = useTheme();
  const isDark = mode === 'dark';

  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCpo, setSelectedCpo] = useState<string>('all');
  const [selectedPower, setSelectedPower] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [selectedConnector, setSelectedConnector] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdownType>(null);
  const [dropdownSearchText, setDropdownSearchText] = useState('');

  const cameraRef = useRef<any>(null);
  const sheetHeightAnim = useRef(new Animated.Value(SHEET_COLLAPSED_HEIGHT)).current;

  // Master State & District Data directly from Master DB (36 States, 719 Districts)
  const allStates = ALL_STATES || [];
  const allDistricts = ALL_DISTRICTS_WITH_STATE || [];

  // Filtered districts list: strictly dependent on selectedState
  const districtsForSelectedState = useMemo(() => {
    if (!selectedState || selectedState === 'all') {
      return allDistricts;
    }
    const dists = getDistrictsForState(selectedState);
    if (!dists || dists.length === 0) return [];
    return dists.map((d) => ({
      district: d,
      state: selectedState,
    }));
  }, [selectedState, allDistricts]);

  // Count active stations per state for helpful UI badges
  const stateStationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of mockStations) {
      if (s && s.state) {
        const key = String(s.state).toLowerCase().trim();
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return counts;
  }, []);

  // Count active stations per district for helpful UI badges
  const districtStationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of mockStations) {
      if (s && s.district) {
        const key = String(s.district).toLowerCase().trim();
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return counts;
  }, []);

  // Filtered stations based on State, District, dropdown filters, and search
  const filteredStations = useMemo(() => {
    return mockStations.filter((s) => {
      // 1. Search Query (Station Name, CPO, City, District, State, Address)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.cpo?.name && s.cpo.name.toLowerCase().includes(q)) ||
          (s.city && s.city.toLowerCase().includes(q)) ||
          (s.district && s.district.toLowerCase().includes(q)) ||
          (s.state && s.state.toLowerCase().includes(q)) ||
          (s.address && s.address.toLowerCase().includes(q));
        if (!match) return false;
      }

      // 2. State Filter
      if (selectedState !== 'all') {
        const stateMatch = s.state && s.state.toLowerCase().trim() === selectedState.toLowerCase().trim();
        if (!stateMatch) return false;
      }

      // 3. District Filter (bound to state)
      if (selectedDistrict !== 'all') {
        const districtMatch = s.district && s.district.toLowerCase().trim() === selectedDistrict.toLowerCase().trim();
        if (!districtMatch) return false;
      }

      // 4. CPO Dropdown Filter
      if (selectedCpo !== 'all') {
        const cpoLower = s.cpo?.name?.toLowerCase() || '';
        if (selectedCpo === 'tata' && !cpoLower.includes('tata')) return false;
        if (selectedCpo === 'jio' && !cpoLower.includes('jio')) return false;
        if (selectedCpo === 'statiq' && !cpoLower.includes('statiq')) return false;
        if (selectedCpo === 'chargezone' && !cpoLower.includes('chargezone')) return false;
        if (selectedCpo === 'ather' && !cpoLower.includes('ather')) return false;
        if (selectedCpo === 'zeon' && !cpoLower.includes('zeon')) return false;
      }

      // 5. Power Dropdown Filter
      if (selectedPower === 'ultra' && s.maxPowerKw < 120) return false;
      if (selectedPower === 'fast' && (s.maxPowerKw < 50 || s.maxPowerKw >= 120)) return false;
      if (selectedPower === 'ac_fast' && (s.maxPowerKw < 15 || s.maxPowerKw > 30)) return false;
      if (selectedPower === 'ac_normal' && s.maxPowerKw > 15) return false;

      // 6. Availability Dropdown Filter
      if (selectedAvailability === 'available' && s.availableCount === 0) return false;
      if (selectedAvailability === 'occupied' && s.availableCount > 0) return false;

      // 7. Connector Dropdown Filter
      if (selectedConnector === 'ccs2' && !s.connectors?.some((c) => c.type?.toUpperCase().includes('CCS'))) return false;
      if (selectedConnector === 'type2' && !s.connectors?.some((c) => c.type?.toUpperCase().includes('TYPE2'))) return false;
      if (selectedConnector === 'chademo' && !s.connectors?.some((c) => c.type?.toUpperCase().includes('CHADEMO'))) return false;
      if (selectedConnector === 'gbt' && !s.connectors?.some((c) => c.type?.toUpperCase().includes('GB/T') || c.type?.toUpperCase().includes('GBT'))) return false;

      return true;
    });
  }, [searchQuery, selectedState, selectedDistrict, selectedCpo, selectedPower, selectedAvailability, selectedConnector]);

  const [selectedStation, setSelectedStation] = useState<StationWithDetails | null>(
    mockStations.length > 0 ? mockStations[0] : null
  );

  // Synchronize selectedStation whenever filtered list changes
  useEffect(() => {
    if (filteredStations.length > 0) {
      const isValid = filteredStations.some((s) => s.id === selectedStation?.id);
      if (!isValid) {
        setSelectedStation(filteredStations[0]);
        if (cameraRef.current && filteredStations[0]?.coordinates) {
          cameraRef.current.setCamera({
            centerCoordinate: [
              filteredStations[0].coordinates.longitude,
              filteredStations[0].coordinates.latitude,
            ],
            zoomLevel: 14.5,
            animationDuration: 700,
          });
        }
      }
    } else {
      setSelectedStation(null);
    }
  }, [filteredStations]);

  // Animate sheet expand/collapse
  const toggleSheet = (expand?: boolean) => {
    const target = typeof expand === 'boolean' ? expand : !isExpanded;
    setIsExpanded(target);
    Animated.spring(sheetHeightAnim, {
      toValue: target ? SHEET_EXPANDED_HEIGHT : SHEET_COLLAPSED_HEIGHT,
      damping: 20,
      stiffness: 200,
      useNativeDriver: false,
    }).start();
  };

  // Pan Responder for smooth sliding bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -35) {
          toggleSheet(true);
        } else if (gestureState.dy > 35) {
          toggleSheet(false);
        }
      },
    })
  ).current;

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ]);
        } catch {
          // Permission prompt dismissed
        }
      }
    };
    requestLocationPermission();
  }, []);

  const handleSelectStation = useCallback((station: StationWithDetails) => {
    if (!station) return;
    setSelectedStation(station);
    if (cameraRef.current && station.coordinates) {
      cameraRef.current.setCamera({
        centerCoordinate: [station.coordinates.longitude, station.coordinates.latitude],
        zoomLevel: 14.5,
        animationDuration: 800,
      });
    }
  }, []);

  const handleRecenterUserLocation = () => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: 14.8,
        animationDuration: 900,
      });
    } else if (filteredStations.length > 0) {
      handleSelectStation(filteredStations[0]);
    }
  };

  const resetAllFilters = () => {
    setSelectedState('all');
    setSelectedDistrict('all');
    setSelectedCpo('all');
    setSelectedPower('all');
    setSelectedAvailability('all');
    setSelectedConnector('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedState !== 'all' ||
    selectedDistrict !== 'all' ||
    selectedCpo !== 'all' ||
    selectedPower !== 'all' ||
    selectedAvailability !== 'all' ||
    selectedConnector !== 'all' ||
    searchQuery.trim().length > 0;

  // Helper label getters for dropdown headers
  const getStateLabel = () => {
    return selectedState === 'all' ? 'All States' : selectedState;
  };

  const getDistrictLabel = () => {
    return selectedDistrict === 'all' ? 'All Districts' : selectedDistrict;
  };

  const getCpoLabel = () => {
    const item = CPO_OPTIONS.find((c) => c.id === selectedCpo);
    return selectedCpo === 'all' ? 'All CPOs' : item ? item.label.split(' ')[0] : 'CPO';
  };

  const getPowerLabel = () => {
    if (selectedPower === 'ultra') return '120kW+';
    if (selectedPower === 'fast') return '50-120kW';
    if (selectedPower === 'ac_fast') return '22kW AC';
    if (selectedPower === 'ac_normal') return '3.3-7.4kW';
    return 'All Speeds';
  };

  const getAvailabilityLabel = () => {
    if (selectedAvailability === 'available') return '🟢 Available';
    if (selectedAvailability === 'occupied') return '🔴 In-Use';
    return 'Availability';
  };

  const getConnectorLabel = () => {
    if (selectedConnector === 'ccs2') return '⚡ CCS2';
    if (selectedConnector === 'type2') return '🔌 Type 2';
    if (selectedConnector === 'chademo') return '⚡ CHAdeMO';
    if (selectedConnector === 'gbt') return '🔌 GB/T';
    return 'Connector';
  };

  // Search filtered states list (Alphabetically sorted)
  const filteredStatesList = useMemo(() => {
    if (!dropdownSearchText.trim()) return allStates;
    const q = dropdownSearchText.toLowerCase().trim();
    return allStates.filter((st) => st && st.toLowerCase().includes(q));
  }, [allStates, dropdownSearchText]);

  // Search filtered districts list (Alphabetically sorted)
  const filteredDistrictsList = useMemo(() => {
    if (!dropdownSearchText.trim()) return districtsForSelectedState;
    const q = dropdownSearchText.toLowerCase().trim();
    return districtsForSelectedState.filter(
      (item) =>
        item &&
        item.district &&
        (item.district.toLowerCase().includes(q) || (item.state && item.state.toLowerCase().includes(q)))
    );
  }, [districtsForSelectedState, dropdownSearchText]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Floating Active Charging Session Banner */}
      {isCharging && <ActiveSessionBanner />}

      {/* Top Floating Search & Dropdown Filter Bars */}
      <View
        style={[
          styles.topFloatingSection,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        {/* Search Input Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search state, district, city, station or CPO..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearIcon, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dynamic Dropdown Filter Chips Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {/* 1. State Dropdown (Master 36 States & UTs) */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedState !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => {
              setDropdownSearchText('');
              setActiveDropdown('state');
            }}
          >
            <Text style={styles.dropdownIcon}>🏛️</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedState !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
              numberOfLines={1}
            >
              {getStateLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedState !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 2. District Dropdown (Strictly Dependent on Selected State) */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedDistrict !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => {
              setDropdownSearchText('');
              setActiveDropdown('district');
            }}
          >
            <Text style={styles.dropdownIcon}>📍</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedDistrict !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
              numberOfLines={1}
            >
              {getDistrictLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedDistrict !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 3. CPO Operator Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedCpo !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => setActiveDropdown('cpo')}
          >
            <Text style={styles.dropdownIcon}>🏢</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedCpo !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              {getCpoLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedCpo !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 4. Power Speed Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedPower !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => setActiveDropdown('power')}
          >
            <Text style={styles.dropdownIcon}>⚡</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedPower !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              {getPowerLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedPower !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 5. Availability Status Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedAvailability !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => setActiveDropdown('availability')}
          >
            <Text style={styles.dropdownIcon}>🟢</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedAvailability !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              {getAvailabilityLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedAvailability !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 6. Connector Type Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedConnector !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => setActiveDropdown('connector')}
          >
            <Text style={styles.dropdownIcon}>🔌</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedConnector !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              {getConnectorLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedConnector !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* Reset Filters Pill */}
          {hasActiveFilters && (
            <TouchableOpacity
              style={[
                styles.resetPill,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
              activeOpacity={0.8}
              onPress={resetAllFilters}
            >
              <Text style={[styles.resetPillText, { color: theme.textSecondary }]}>✕ Reset</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Clean Simple Map Viewport Area (High Default Zoom) */}
      <View style={styles.mapContainer}>
        <MapLibreGL.MapView
          style={styles.mapView}
          mapStyle={getCleanMapStyle(isDark)}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <MapLibreGL.Camera
            ref={cameraRef}
            zoomLevel={14.5}
            centerCoordinate={
              selectedStation?.coordinates
                ? [selectedStation.coordinates.longitude, selectedStation.coordinates.latitude]
                : DEFAULT_COORDINATE
            }
            animationMode="flyTo"
            animationDuration={800}
          />

          {/* Live User Location */}
          <MapLibreGL.UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
            onUpdate={(loc: any) => {
              if (loc?.coords) {
                setUserLocation([loc.coords.longitude, loc.coords.latitude]);
              }
            }}
          />

          {/* Simple Clean Map Pins */}
          {filteredStations.map((station) => {
            const isSelected = selectedStation?.id === station.id;
            const isAvailable = station.availableCount > 0;

            return (
              <MapLibreGL.PointAnnotation
                key={station.id}
                id={station.id}
                coordinate={[station.coordinates.longitude, station.coordinates.latitude]}
                onSelected={() => handleSelectStation(station)}
              >
                <View
                  style={[
                    styles.simpleMapPin,
                    {
                      backgroundColor: isAvailable ? '#16A34A' : '#EA580C',
                    },
                    isSelected && styles.simpleMapPinSelected,
                  ]}
                >
                  <Text style={styles.simplePinText}>
                    ⚡ {station.maxPowerKw}kW
                  </Text>
                </View>
              </MapLibreGL.PointAnnotation>
            );
          })}
        </MapLibreGL.MapView>

        {/* Clean GPS Button Inside Map Viewport (Top-Right) */}
        <TouchableOpacity
          style={[
            styles.gpsFloatButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          activeOpacity={0.85}
          onPress={handleRecenterUserLocation}
        >
          <Text style={styles.gpsFloatIcon}>🎯</Text>
        </TouchableOpacity>

        {/* Sliding Bottom Sheet for Stations (Draggable & Expandable) */}
        <Animated.View
          style={[
            styles.slidingBottomSheet,
            {
              height: sheetHeightAnim,
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
            },
          ]}
        >
          {/* Drag Handle Bar & Header */}
          <View {...panResponder.panHandlers} style={styles.sheetHandleArea}>
            <View style={[styles.sheetDragBar, { backgroundColor: theme.textMuted }]} />
            <TouchableOpacity
              onPress={() => toggleSheet()}
              style={styles.sheetHeaderToggle}
              activeOpacity={0.8}
            >
              <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
                {filteredStations.length > 0
                  ? isExpanded
                    ? `⚡ Matching Charging Hubs (${filteredStations.length})`
                    : `⚡ ${selectedStation ? selectedStation.name : 'Selected Hub'}`
                  : '🔍 No Matching Charging Hubs'}
              </Text>
              <Text style={[styles.sheetSubtitle, { color: theme.primary }]}>
                {filteredStations.length > 0
                  ? isExpanded
                    ? 'Slide Down to Collapse ▾'
                    : `Slide Up for All ${filteredStations.length} Matching Hubs ▴`
                  : 'Tap to reset all active filters'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* List of Stations (Expandable Scroll) */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetScrollContent}
          >
            {filteredStations.length > 0 ? (
              <>
                {/* Active Selected Card Preview (when collapsed) */}
                {!isExpanded && selectedStation && (
                  <View style={styles.stationCardWrap}>
                    <StationCard
                      station={selectedStation}
                      onPress={() =>
                        navigation.navigate('StationDetail', { stationId: selectedStation.id })
                      }
                    />
                  </View>
                )}

                {/* If Expanded, show all matching stations in filter */}
                {isExpanded && (
                  <View style={styles.expandedStationsList}>
                    <Text style={[styles.expandedSectionHeader, { color: theme.textSecondary }]}>
                      MATCHING HUBS IN FILTER ({filteredStations.length})
                    </Text>
                    {filteredStations.map((station) => {
                      const isSelected = selectedStation?.id === station.id;
                      return (
                        <TouchableOpacity
                          key={station.id}
                          activeOpacity={0.9}
                          onPress={() => handleSelectStation(station)}
                          style={[
                            styles.stationCardWrap,
                            isSelected && {
                              borderWidth: 1.5,
                              borderColor: theme.primary,
                              borderRadius: borderRadius.xxl,
                              marginHorizontal: 14,
                            },
                          ]}
                        >
                          <StationCard
                            station={station}
                            onPress={() =>
                              navigation.navigate('StationDetail', { stationId: station.id })
                            }
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            ) : (
              /* Empty State */
              <View style={styles.emptyFilteredBox}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  No Stations Match This Filter
                </Text>
                <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                  Try clearing specific dropdowns or search terms.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyResetBtn, { backgroundColor: theme.primary }]}
                  onPress={resetAllFilters}
                >
                  <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Full-Height Interactive Dropdown Picker Bottom Sheet Modal */}
      <Modal
        visible={activeDropdown !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setActiveDropdown(null);
          setDropdownSearchText('');
        }}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop Tap to Close */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => {
              setActiveDropdown(null);
              setDropdownSearchText('');
            }}
          />

          {/* Structured Bottom Sheet Container (76% Screen Height) */}
          <View style={[styles.dropdownModalSheet, { backgroundColor: theme.surface }]}>
            {/* Sheet Handle */}
            <View style={styles.modalSheetHandleBar} />

            {/* Dropdown Header with Item Counter */}
            <View style={styles.dropdownModalHeader}>
              <Text style={[styles.dropdownModalTitle, { color: theme.textPrimary }]}>
                {activeDropdown === 'state' && `🏛️ Select State / UT (${allStates.length})`}
                {activeDropdown === 'district' &&
                  (selectedState === 'all'
                    ? `📍 Select District (${allDistricts.length} across India)`
                    : `📍 Select District in ${selectedState} (${districtsForSelectedState.length})`)}
                {activeDropdown === 'cpo' && '🏢 Select CPO Network'}
                {activeDropdown === 'power' && '⚡ Select Charging Speed'}
                {activeDropdown === 'availability' && '🟢 Select Availability Status'}
                {activeDropdown === 'connector' && '🔌 Select Connector Type'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setActiveDropdown(null);
                  setDropdownSearchText('');
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input for State/District Modals */}
            {(activeDropdown === 'state' || activeDropdown === 'district') && (
              <View
                style={[
                  styles.modalSearchBox,
                  { backgroundColor: theme.inputBg, borderColor: theme.border },
                ]}
              >
                <Text style={{ marginRight: 6 }}>🔍</Text>
                <TextInput
                  style={[styles.modalSearchInput, { color: theme.textPrimary }]}
                  placeholder={
                    activeDropdown === 'state'
                      ? 'Search all 36 States/UTs...'
                      : selectedState === 'all'
                      ? 'Search all 719 districts...'
                      : `Search ${districtsForSelectedState.length} districts in ${selectedState}...`
                  }
                  placeholderTextColor={theme.textMuted}
                  value={dropdownSearchText}
                  onChangeText={setDropdownSearchText}
                />
                {dropdownSearchText.length > 0 && (
                  <TouchableOpacity onPress={() => setDropdownSearchText('')}>
                    <Text style={{ color: theme.textSecondary, fontSize: 13, padding: 4 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 1. High-Performance State Picker FlatList */}
            {activeDropdown === 'state' && (
              <View style={styles.listContainer}>
                <FlatList
                  data={filteredStatesList}
                  keyExtractor={(item, index) => `state-${item}-${index}`}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={20}
                  maxToRenderPerBatch={25}
                  contentContainerStyle={styles.flatListContent}
                  ListHeaderComponent={
                    <TouchableOpacity
                      style={[
                        styles.dropdownOptionRow,
                        { borderColor: theme.border },
                        selectedState === 'all' && {
                          backgroundColor: theme.primaryLight,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => {
                        setSelectedState('all');
                        setSelectedDistrict('all');
                        setActiveDropdown(null);
                        setDropdownSearchText('');
                      }}
                    >
                      <View style={styles.optIconBox}>
                        <Text style={{ fontSize: 18 }}>🇮🇳</Text>
                      </View>
                      <View style={styles.optTextBox}>
                        <Text
                          style={[
                            styles.optLabel,
                            { color: theme.textPrimary },
                            selectedState === 'all' && { color: theme.primary, fontWeight: '800' },
                          ]}
                        >
                          All States &amp; UTs (Pan-India)
                        </Text>
                        <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                          Show charging hubs across all 36 States &amp; UTs
                        </Text>
                      </View>
                      <Text style={{ fontSize: 18, color: theme.primary }}>
                        {selectedState === 'all' ? '●' : '○'}
                      </Text>
                    </TouchableOpacity>
                  }
                  renderItem={({ item: stateName }) => {
                    if (!stateName) return null;
                    const isSelected = selectedState.toLowerCase().trim() === stateName.toLowerCase().trim();
                    const dists = getDistrictsForState(stateName);
                    const distCount = dists ? dists.length : 0;
                    const stationCount = stateStationCounts[stateName.toLowerCase().trim()] || 0;

                    return (
                      <TouchableOpacity
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedState(stateName);
                          setSelectedDistrict('all');
                          setActiveDropdown(null);
                          setDropdownSearchText('');
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>🏛️</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text
                              style={[
                                styles.optLabel,
                                { color: theme.textPrimary },
                                isSelected && { color: theme.primary, fontWeight: '800' },
                              ]}
                            >
                              {stateName}
                            </Text>
                            {stationCount > 0 && (
                              <View style={[styles.activeStationBadge, { backgroundColor: theme.primaryLight }]}>
                                <Text style={[styles.activeStationBadgeText, { color: theme.primary }]}>
                                  ⚡ {stationCount} Hub{stationCount > 1 ? 's' : ''}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                            {distCount} Districts mapped
                          </Text>
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}

            {/* 2. High-Performance District Picker FlatList (Strictly Dependent on Selected State) */}
            {activeDropdown === 'district' && (
              <View style={styles.listContainer}>
                <FlatList
                  data={filteredDistrictsList}
                  keyExtractor={(item, index) => `dist-${item?.state}-${item?.district}-${index}`}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={20}
                  maxToRenderPerBatch={25}
                  contentContainerStyle={styles.flatListContent}
                  ListHeaderComponent={
                    <TouchableOpacity
                      style={[
                        styles.dropdownOptionRow,
                        { borderColor: theme.border },
                        selectedDistrict === 'all' && {
                          backgroundColor: theme.primaryLight,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => {
                        setSelectedDistrict('all');
                        setActiveDropdown(null);
                        setDropdownSearchText('');
                      }}
                    >
                      <View style={styles.optIconBox}>
                        <Text style={{ fontSize: 18 }}>📍</Text>
                      </View>
                      <View style={styles.optTextBox}>
                        <Text
                          style={[
                            styles.optLabel,
                            { color: theme.textPrimary },
                            selectedDistrict === 'all' && { color: theme.primary, fontWeight: '800' },
                          ]}
                        >
                          {selectedState === 'all'
                            ? 'All Districts across India'
                            : `All Districts in ${selectedState}`}
                        </Text>
                        <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                          {selectedState === 'all'
                            ? 'Show stations from all 719 districts'
                            : `Show all ${districtsForSelectedState.length} districts in ${selectedState}`}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 18, color: theme.primary }}>
                        {selectedDistrict === 'all' ? '●' : '○'}
                      </Text>
                    </TouchableOpacity>
                  }
                  renderItem={({ item }) => {
                    if (!item || !item.district) return null;
                    const isSelected =
                      selectedDistrict.toLowerCase().trim() === item.district.toLowerCase().trim();
                    const stationCount = districtStationCounts[item.district.toLowerCase().trim()] || 0;

                    return (
                      <TouchableOpacity
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          if (item.state) {
                            setSelectedState(item.state);
                          }
                          setSelectedDistrict(item.district);
                          setActiveDropdown(null);
                          setDropdownSearchText('');
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>⚡</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text
                              style={[
                                styles.optLabel,
                                { color: theme.textPrimary },
                                isSelected && { color: theme.primary, fontWeight: '800' },
                              ]}
                            >
                              {item.district}
                            </Text>
                            {stationCount > 0 && (
                              <View style={[styles.activeStationBadge, { backgroundColor: theme.primaryLight }]}>
                                <Text style={[styles.activeStationBadgeText, { color: theme.primary }]}>
                                  ⚡ {stationCount} Hub{stationCount > 1 ? 's' : ''}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                            {item.state}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}

            {/* Other Filter Dropdowns (CPO, Power, Availability, Connector) */}
            {activeDropdown !== 'state' && activeDropdown !== 'district' && (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.dropdownOptionsScroll}>
                {/* 3. CPO Options */}
                {activeDropdown === 'cpo' &&
                  CPO_OPTIONS.map((opt) => {
                    const isSelected = selectedCpo === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedCpo(opt.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <Text
                            style={[
                              styles.optLabel,
                              { color: theme.textPrimary },
                              isSelected && { color: theme.primary, fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.sublabel && (
                            <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                              {opt.sublabel}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {/* 4. Power Options */}
                {activeDropdown === 'power' &&
                  POWER_OPTIONS.map((opt) => {
                    const isSelected = selectedPower === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedPower(opt.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <Text
                            style={[
                              styles.optLabel,
                              { color: theme.textPrimary },
                              isSelected && { color: theme.primary, fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.sublabel && (
                            <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                              {opt.sublabel}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {/* 5. Availability Options */}
                {activeDropdown === 'availability' &&
                  AVAILABILITY_OPTIONS.map((opt) => {
                    const isSelected = selectedAvailability === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedAvailability(opt.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <Text
                            style={[
                              styles.optLabel,
                              { color: theme.textPrimary },
                              isSelected && { color: theme.primary, fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.sublabel && (
                            <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                              {opt.sublabel}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {/* 6. Connector Options */}
                {activeDropdown === 'connector' &&
                  CONNECTOR_OPTIONS.map((opt) => {
                    const isSelected = selectedConnector === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedConnector(opt.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <Text
                            style={[
                              styles.optLabel,
                              { color: theme.textPrimary },
                              isSelected && { color: theme.primary, fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.sublabel && (
                            <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                              {opt.sublabel}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topFloatingSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: 13,
    padding: 4,
  },
  filterScroll: {
    paddingTop: 8,
    paddingBottom: 2,
    gap: 8,
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1.2,
    marginRight: 2,
  },
  dropdownIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  dropdownPillText: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 130,
  },
  dropdownChevron: {
    fontSize: 10,
    marginLeft: 5,
    fontWeight: '800',
  },
  resetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  resetPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  // Map Viewport
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapView: {
    flex: 1,
  },
  // Simple Clean Map Pin
  simpleMapPin: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  simpleMapPinSelected: {
    transform: [{ scale: 1.18 }],
    borderWidth: 2.5,
    elevation: 8,
  },
  simplePinText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  // GPS Button inside Top-Right of Map
  gpsFloatButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 15,
  },
  gpsFloatIcon: {
    fontSize: 18,
  },
  // Sliding Bottom Sheet
  slidingBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 20,
  },
  sheetHandleArea: {
    paddingTop: 8,
    paddingBottom: 6,
    alignItems: 'center',
  },
  sheetDragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
    opacity: 0.5,
  },
  sheetHeaderToggle: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sheetTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  sheetScrollContent: {
    paddingTop: 6,
    paddingBottom: 24,
  },
  stationCardWrap: {
    marginBottom: 4,
  },
  expandedStationsList: {
    marginTop: 8,
  },
  expandedSectionHeader: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emptyFilteredBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11.5,
    textAlign: 'center',
    marginBottom: 14,
  },
  emptyResetBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  // Modal Overlay & Structured Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  dropdownModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    height: height * 0.76,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  modalSheetHandleBar: {
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(150, 150, 150, 0.45)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  dropdownModalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    flex: 1,
  },
  modalCloseText: {
    fontSize: 13.5,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: 10,
    height: 42,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 32,
  },
  dropdownOptionsScroll: {
    flex: 1,
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: 8,
  },
  optIconBox: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optTextBox: {
    flex: 1,
    marginRight: 10,
  },
  optLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  optSublabel: {
    fontSize: 11,
    marginTop: 2,
  },
  activeStationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  activeStationBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
