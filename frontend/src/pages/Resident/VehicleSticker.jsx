import {useState,useEffect} from "react";
import {Car,Bike,FileText,Upload,BadgeCheck,LoaderCircle,Clock3,CircleCheckBig,CircleX,CheckCircle2,Lock,Wallet} from "lucide-react";

import {auth,db} from "../../firebase";
import {collection,addDoc,getDocs,getDoc,doc,query,where,serverTimestamp,setDoc,orderBy,updateDoc} from "firebase/firestore";
import {onAuthStateChanged} from "firebase/auth";
import {uploadImage} from "../../services/cloudinary";

import stickerImg from "../../assets/VehicleStickerBg.jpg";
import gcash from "../../assets/gcash.jpg";

export default function VehicleSticker(){

const [resident,setResident]=useState(null);
const [loadingResident,setLoadingResident]=useState(true);
const [submitting,setSubmitting]=useState(false);

const [formData,setFormData]=useState({
vehicleType:"",
plateNumber:"",
});

const [orcrFile,setOrcrFile]=useState(null);
const [receiptFiles,setReceiptFiles]=useState({});
const [applications,setApplications]=useState([]);

const [pricing,setPricing]=useState({
homeownerCarPrice:150,
homeownerMotorcyclePrice:100,
homeownerTribikePrice:120,
renterCarPrice:200,
renterMotorcyclePrice:150,
renterTribikePrice:170,
householdCarPrice:180,
householdMotorcyclePrice:130,
householdTribikePrice:150,
});

const handleChange=e=>{
setFormData({...formData,[e.target.name]:e.target.value});
};

const loadApplications=async(residentId)=>{

const snapshot=await getDocs(query(
collection(db,"vehicleStickerApplications"),
where("residentId","==",residentId),
orderBy("createdAt","desc")
));

setApplications(snapshot.docs.map(doc=>({
id:doc.id,
...doc.data(),
})));

};

const getStickerFee=()=>{

if(!resident)return 0;

const category=resident.residentCategory?.toLowerCase();
const vehicle=formData.vehicleType.toLowerCase();

if(category==="homeowner"){
if(vehicle==="car")return pricing.homeownerCarPrice;
if(vehicle==="motorcycle")return pricing.homeownerMotorcyclePrice;
if(vehicle==="tri-bike")return pricing.homeownerTribikePrice;
}

if(category==="renter"){
if(vehicle==="car")return pricing.renterCarPrice;
if(vehicle==="motorcycle")return pricing.renterMotorcyclePrice;
if(vehicle==="tri-bike")return pricing.renterTribikePrice;
}

if(category==="household"){
if(vehicle==="car")return pricing.householdCarPrice;
if(vehicle==="motorcycle")return pricing.householdMotorcyclePrice;
if(vehicle==="tri-bike")return pricing.householdTribikePrice;
}

return 0;

};

const selectedFee=getStickerFee();

useEffect(()=>{

const unsubscribe=onAuthStateChanged(auth,async(user)=>{

if(!user){
setLoadingResident(false);
return;
}

try{

const residentQuery=query(
collection(db,"residents"),
where("email","==",user.email)
);

const residentSnapshot=await getDocs(residentQuery);

if(!residentSnapshot.empty){

const residentDoc=residentSnapshot.docs[0];

const residentInfo={
id:residentDoc.id,
...residentDoc.data(),
};

setResident(residentInfo);

const settingsRef=doc(db,"vehicleSticker","settings");
const settingsSnap=await getDoc(settingsRef);

if(!settingsSnap.exists()){

const defaultPricing={
homeownerCarPrice:150,
homeownerMotorcyclePrice:100,
homeownerTribikePrice:120,
renterCarPrice:200,
renterMotorcyclePrice:150,
renterTribikePrice:170,
householdCarPrice:180,
householdMotorcyclePrice:130,
householdTribikePrice:150,
};

await setDoc(settingsRef,defaultPricing);
setPricing(defaultPricing);

}else{

setPricing(settingsSnap.data());

}

await loadApplications(residentDoc.id);

}

}catch(error){

console.error("Vehicle Sticker Error:",error);

}finally{

setLoadingResident(false);

}

});

return()=>unsubscribe();

},[]);

const handleStep1Submit=async(e)=>{

e.preventDefault();

if(!resident){alert("Resident information not found.");return;}
if(!formData.vehicleType){alert("Please select vehicle type.");return;}
if(!formData.plateNumber.trim()){alert("Please enter plate number.");return;}
if(!orcrFile){alert("Please upload your OR/CR.");return;}

try{

setSubmitting(true);

const uploadedOrcr=await uploadImage(orcrFile,"vehicleSticker");

const applicationData={

residentId:resident.id,

residentInfo:{
firstName:resident.firstName,
lastName:resident.lastName,
fullName:`${resident.firstName} ${resident.lastName}`,
residentCategory:resident.residentCategory,
contactNumber:resident.contactNumber,
email:resident.email,
},

vehicleInfo:{
vehicleType:formData.vehicleType,
plateNumber:formData.plateNumber.trim().toUpperCase(),
},

stickerFee:selectedFee,

orcrInfo:{
fileName:orcrFile.name,
fileSize:orcrFile.size,
fileType:orcrFile.type,
secureUrl:uploadedOrcr.secureUrl,
publicId:uploadedOrcr.publicId,
resourceType:uploadedOrcr.resourceType,
uploadStatus:"uploaded",
},

receiptInfo:null,

status:"Pending",
paymentStatus:"Locked",
remarks:"",
createdAt:serverTimestamp(),

};

const docRef=await addDoc(
collection(db,"vehicleStickerApplications"),
applicationData
);

console.log("Application Saved:",docRef.id);

await loadApplications(resident.id);

setFormData({
vehicleType:"",
plateNumber:"",
});

setOrcrFile(null);

alert("Step 1 submitted successfully.");

}catch(error){

console.error("Submit Error:",error);
alert(error.message);

}finally{

setSubmitting(false);

}

};
const handleReceiptUpload=async(applicationId,file)=>{

if(!file){
alert("Please choose a receipt.");
return;
}

try{

const uploadedReceipt=await uploadImage(file,"vehicleSticker");

await updateDoc(
doc(db,"vehicleStickerApplications",applicationId),
{
receiptInfo:{
fileName:file.name,
fileSize:file.size,
fileType:file.type,
secureUrl:uploadedReceipt.secureUrl,
publicId:uploadedReceipt.publicId,
resourceType:uploadedReceipt.resourceType,
uploadStatus:"uploaded",
},
paymentStatus:"Submitted"
}
);

await loadApplications(resident.id);

setReceiptFiles(prev=>({
...prev,
[applicationId]:null,
}));

alert("Receipt uploaded successfully.");

}catch(error){

console.error("Receipt Upload Error:",error);
alert(error.message);

}

};

return(
<div className="min-h-screen bg-gray-100">

{/* HERO */}
<div
className="relative h-[300px] bg-cover bg-center"
style={{backgroundImage:`url(${stickerImg})`}}
>
<div className="absolute inset-0 bg-black/50"/>
<div className="relative h-full flex flex-col items-center justify-center text-center px-6">
<h1 className="text-5xl font-bold text-white">Vehicle Sticker</h1>
<p className="text-lg text-gray-200 mt-3 max-w-2xl">
Submit your OR/CR first. Once the HOA verifies and accepts your documents, the payment section will automatically unlock for your corresponding vehicle application.
</p>
</div>
</div>

<div className="max-w-7xl mx-auto px-6 py-10">

{/* STEP INDICATOR */}
<div className="bg-white rounded-2xl shadow-lg p-8 mb-8">

<div className="flex items-center justify-between">

<div className="flex items-center gap-4">

<div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-white">
<FileText size={28}/>
</div>

<div>
<p className="text-sm text-gray-500">Step 1</p>
<h2 className="text-xl font-bold">Submit OR/CR</h2>
</div>

</div>

<div className="flex-1 h-1 bg-gray-300 mx-8 rounded-full"/>

<div className="flex items-center gap-4">

<div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-white">
<Wallet size={28}/>
</div>

<div>
<p className="text-sm text-gray-500">Step 2</p>
<h2 className="text-xl font-bold">Payment</h2>
</div>

</div>

</div>

<div className="mt-8 p-5 rounded-xl bg-yellow-50 border border-yellow-200">

<div className="flex items-center gap-3">

<Lock className="text-yellow-600"/>

<div>

<p className="font-semibold">
Step 2 will only unlock after the HOA has approved your OR/CR.
</p>

<p className="text-sm text-gray-600 mt-1">
Each approved application will generate its own payment card together with its own receipt upload box.
</p>

</div>

</div>

</div>

</div>

{/* STEP 1 */}
<div className="bg-white rounded-2xl shadow-lg p-8">

<h2 className="text-2xl font-bold mb-6">
Step 1 • Vehicle Information & OR/CR
</h2>

<form
onSubmit={handleStep1Submit}
className="space-y-6"
>

<div className="grid md:grid-cols-2 gap-6">

<div>

<label className="block font-semibold mb-2">
Vehicle Type
</label>

<select
name="vehicleType"
value={formData.vehicleType}
onChange={handleChange}
className="w-full border rounded-lg px-4 py-3"
>

<option value="">Select Vehicle</option>
<option value="Car">Four-Wheeled</option>
<option value="Motorcycle">Motorcycle</option>
<option value="Tri-bike">Tri-bike</option>

</select>

</div>

<div>

<label className="block font-semibold mb-2">
Plate Number
</label>

<input
type="text"
name="plateNumber"
value={formData.plateNumber}
onChange={handleChange}
placeholder="ABC-1234"
className="w-full border rounded-lg px-4 py-3"
/>

</div>

</div>
{/* Resident + Pricing */}

<div className="grid md:grid-cols-2 gap-6">

<div className="border rounded-xl bg-gray-50 p-5">

<h3 className="text-xl font-bold mb-5">
Resident Information
</h3>

<div className="space-y-3">

<p><span className="font-semibold">Name:</span> {resident?.firstName} {resident?.lastName}</p>

<p><span className="font-semibold">Resident Type:</span> {resident?.residentCategory}</p>

<p><span className="font-semibold">Contact Number:</span> {resident?.contactNumber}</p>

<p><span className="font-semibold">Email:</span> {resident?.email}</p>

</div>

</div>

<div className="border rounded-xl p-5">

<h3 className="text-xl font-bold mb-5">
Vehicle Sticker Fees
</h3>

<div className="space-y-4">

<div className="rounded-lg bg-green-50 border p-4">

<p className="font-bold text-green-700 mb-2">
Homeowner
</p>

<div className="flex justify-between">
<span>Car</span>
<span>₱{pricing.homeownerCarPrice}</span>
</div>

<div className="flex justify-between">
<span>Motorcycle</span>
<span>₱{pricing.homeownerMotorcyclePrice}</span>
</div>

<div className="flex justify-between">
<span>Tri-bike</span>
<span>₱{pricing.homeownerTribikePrice}</span>
</div>

</div>

<div className="rounded-lg bg-blue-50 border p-4">

<p className="font-bold text-blue-700 mb-2">
Renter
</p>

<div className="flex justify-between">
<span>Car</span>
<span>₱{pricing.renterCarPrice}</span>
</div>

<div className="flex justify-between">
<span>Motorcycle</span>
<span>₱{pricing.renterMotorcyclePrice}</span>
</div>

<div className="flex justify-between">
<span>Tri-bike</span>
<span>₱{pricing.renterTribikePrice}</span>
</div>

</div>

<div className="rounded-lg bg-yellow-50 border p-4">

<p className="font-bold text-yellow-700 mb-2">
Household
</p>

<div className="flex justify-between">
<span>Car</span>
<span>₱{pricing.householdCarPrice}</span>
</div>

<div className="flex justify-between">
<span>Motorcycle</span>
<span>₱{pricing.householdMotorcyclePrice}</span>
</div>

<div className="flex justify-between">
<span>Tri-bike</span>
<span>₱{pricing.householdTribikePrice}</span>
</div>

</div>

</div>

<div className="mt-5 rounded-xl bg-gray-100 p-5 border">

<p className="font-semibold">
Sticker Fee
</p>

<p className="text-3xl font-bold text-green-700 mt-2">
₱{selectedFee}
</p>

<p className="text-sm text-gray-500 mt-2">
The amount is automatically determined by your resident category and selected vehicle type.
</p>

</div>

</div>

</div>
<div className="mt-8 border rounded-xl p-6 bg-white">

<h3 className="text-2xl font-bold flex items-center gap-2 mb-5">
<FileText className="w-6 h-6"/>
Upload OR/CR
</h3>

<p className="text-gray-600 mb-5">
Upload a clear copy of your Official Receipt and Certificate of Registration. Your application will remain pending until the HOA verifies your documents.
</p>

<label className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-green-600 transition">

<Upload className="w-10 h-10 mb-3 text-gray-500"/>

<p className="font-semibold">
{orcrFile?orcrFile.name:"Click to upload OR/CR"}
</p>

<p className="text-sm text-gray-500 mt-2">
PNG, JPG or PDF
</p>

<input
type="file"
accept="image/*,.pdf"
className="hidden"
onChange={e=>setOrcrFile(e.target.files[0])}
/>

</label>

{orcrFile&&(
<div className="mt-4 flex items-center gap-2 text-green-700 font-medium">

<BadgeCheck className="w-5 h-5"/>

<span>
{orcrFile.name}
</span>

</div>
)}

</div>

<div className="mt-8 flex justify-end">

<button
type="submit"
disabled={submitting}
className="px-8 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold disabled:opacity-50 flex items-center gap-2"
>

{submitting?(
<>
<LoaderCircle className="w-5 h-5 animate-spin"/>
Submitting...
</>
):(
<>
<BadgeCheck className="w-5 h-5"/>
Submit Step 1
</>
)}

</button>

</div>

</form>

</div>

</div>
<div className="max-w-6xl mx-auto mt-16">

<h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
<FileText className="w-8 h-8 text-green-700"/>
My Vehicle Sticker Applications
</h2>

{applications.length===0?(
<div className="bg-white rounded-xl shadow-md p-12 text-center">

<Car className="mx-auto w-16 h-16 text-gray-400 mb-4"/>

<p className="text-lg text-gray-600">
You don't have any Vehicle Sticker applications yet.
</p>

</div>
):(

<div className="space-y-8">

{applications.map(app=>(

<div
key={app.id}
className="bg-white rounded-2xl shadow-lg border overflow-hidden"
>

<div className="flex items-center justify-between bg-gray-100 px-6 py-4">

<div>

<h3 className="text-xl font-bold">
{app.vehicleInfo.vehicleType}
</h3>

<p className="text-gray-600">
Plate Number: {app.vehicleInfo.plateNumber}
</p>

</div>

<div>

{app.status==="Pending"&&(
<span className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold">
<Clock3 className="w-5 h-5"/>
Pending
</span>
)}

{app.status==="Approved"&&(
<span className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
<CircleCheckBig className="w-5 h-5"/>
Approved
</span>
)}

{app.status==="Rejected"&&(
<span className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
<CircleX className="w-5 h-5"/>
Rejected
</span>
)}

</div>

</div>

<div className="p-6 grid md:grid-cols-2 gap-8"></div>
<div>

<h4 className="text-lg font-bold mb-4">
Resident Information
</h4>

<div className="space-y-2 text-gray-700">

<p><span className="font-semibold">Resident:</span> {app.residentInfo.fullName}</p>

<p><span className="font-semibold">Category:</span> {app.residentInfo.residentCategory}</p>

<p><span className="font-semibold">Contact:</span> {app.residentInfo.contactNumber}</p>

<p><span className="font-semibold">Email:</span> {app.residentInfo.email}</p>

<p><span className="font-semibold">Vehicle:</span> {app.vehicleInfo.vehicleType}</p>

<p><span className="font-semibold">Plate Number:</span> {app.vehicleInfo.plateNumber}</p>

<p><span className="font-semibold">Sticker Fee:</span> ₱{app.stickerFee}</p>

</div>

<div className="mt-6">

<h4 className="font-bold mb-3">
Submitted OR/CR
</h4>

<a
href={app.orcrInfo.secureUrl}
target="_blank"
rel="noreferrer"
className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800"
>

<FileText className="w-5 h-5"/>

View OR/CR

</a>

</div>

</div>

<div>

<div className="flex items-center gap-3 mb-5">

<div className={`w-10 h-10 rounded-full flex items-center justify-center ${
app.status==="Approved"
?"bg-green-600 text-white"
:"bg-gray-300 text-gray-600"
}`}>

{app.status==="Approved"
?<CheckCircle2 className="w-5 h-5"/>
:<Lock className="w-5 h-5"/>
}

</div>

<div>

<h4 className="text-xl font-bold">
Step 2 - Payment
</h4>

<p className="text-gray-500 text-sm">
Unlocks only after HOA approval.
</p>

</div>

</div>
{app.status!=="Approved"?(
<div className="rounded-xl border border-yellow-300 bg-yellow-50 p-6">

<div className="flex items-center gap-3 mb-3">

<Lock className="w-6 h-6 text-yellow-600"/>

<h4 className="font-bold text-yellow-700">
Waiting for HOA Approval
</h4>

</div>

<p className="text-gray-600">
Your OR/CR is currently under verification.
Payment will only unlock once your application has been accepted.
</p>

</div>

):(

<div className="space-y-5">

<div className="rounded-xl border p-4">

<h4 className="font-bold mb-3 flex items-center gap-2">

<Wallet className="w-5 h-5"/>

GCash Payment

</h4>

<p className="text-sm text-gray-600 mb-2">
Please pay exactly:
</p>

<p className="text-3xl font-bold text-green-700 mb-4">
₱{app.stickerFee}
</p>

<img
src={gcash}
alt="GCash QR"
className="w-64 rounded-xl border shadow"
/>

</div>

<div>

<label className="font-semibold block mb-2">
Upload Payment Receipt
</label>

<input
type="file"
accept="image/*"
onChange={(e)=>{
if(e.target.files[0]){
setReceiptFiles(prev=>({
...prev,
[app.id]:e.target.files[0]
}));
}
}}
className="w-full border rounded-lg p-2"
/>

</div>
<button
onClick={()=>{
const file=receiptFiles[app.id];
if(!file){
alert("Please select a receipt first.");
return;
}
handleReceiptUpload(app.id,file);
}}
className="w-full py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition flex items-center justify-center gap-2"
>

<Upload className="w-5 h-5"/>

Submit Receipt

</button>

{app.paymentStatus==="Submitted"&&app.receiptInfo&&(

<div className="rounded-xl border border-green-300 bg-green-50 p-4">

<div className="flex items-center gap-2 text-green-700 font-semibold mb-3">

<CircleCheckBig className="w-5 h-5"/>

Receipt Submitted

</div>

<a
href={app.receiptInfo.secureUrl}
target="_blank"
rel="noreferrer"
className="text-blue-600 underline"
>

View Uploaded Receipt

</a>

</div>

)}

</div>

)}

</div>

</div>

))}

</div>

)}

</div>

</div>

);
}