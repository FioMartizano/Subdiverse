function Footer() {
  return (
        <footer className="relative z-10 bg-green-800 text-white rounded-t-3xl px-8 md:px-12 py-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start">
          
          {/* Left Side */}
          <div className="w-full md:w-1/2">
            <div className="w-10 h-3 bg-orange-500 rounded-full mb-3"></div>

            <h2
              className="text-3xl font-bold text-orange-400 leading-tight"
              style={{
               textShadow: "2px 2px 5px #4d3924, 3px 3px 8px #3c3a36",
              }}
            >
              Windward Hills
              <br />
              Subdivision Portal
            </h2>
          </div>
            
            
        <div className="flex gap-20 mt-8 md:mt-0 ml-auto">

          {/* Emergency */}
            <div>
               <h3 className="font-bold gap-60 text-lg text-green-200 mb-4">Emergency Contacts
              </h3>

               <ul className="font-semibold space-y-2 text-s">
               <li>Barangay Hall: (02) 8XXX-XXXX</li>
               <li>Police Station: (02) 8XXX-XXXX</li>
               <li>Fire Station: (02) 8XXX-XXXX</li>
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h3 className="font-bold gap-60 text-lg text-green-200 mb-4">
                Our Services
              </h3>

              <ul className="font-semibold space-y-2 text-sm">
                <li>Reservations</li>
                <li>
                  Vehicle Stickers
                  <br />
                  & Parking
                </li>
                <li>Community</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-lg text-green-200 mb-4">
                Contact Us
              </h3>

              <div className="text-sm space-y-4">
                <div>
                  <p className="font-semibold">Office Number</p>
                  <p>+63 9123918032</p>
                </div>

                <div>
                  <p className="font-semibold">Head Office</p>
                  <p>
                    132 Dartmouth Street
                    <br />
                    Boston, Massachusetts
                    <br />
                    02156 United States
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Divider */}
        <hr className="border-white/40 my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center">
          {/* Replace with your logo */}
          <div className="text-3xl font-bold text-orange-400 mb-2">
            WH
          </div>

          <p className="text-sm text-center">
            © 2026 Subdiverse. All rights reserved.
          </p>
           </div>
      </div>
    </footer>
  );
}

export default Footer;