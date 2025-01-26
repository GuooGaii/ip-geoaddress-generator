<div align="center">

[简体中文](README.md) | [English](README_EN.md)

</div>

# IP-Based Real Address Generator 🌍

A web-based application that generates real random address information based on IP addresses. It utilizes multiple APIs to obtain location data and random user information, providing users with a complete virtual identity.

## Access

https://ip-geoaddress-generator.pages.dev/

## Key Features

### Address Generation
- Automatic generation based on current IP address
- Support for manual IP input or region selection
- Generation of complete random address information
  - Name
  - Phone
  - Country
  - State/Province
  - City
  - SSN (US regions only)

### Address Management
- Display generated addresses on Google Maps
- One-click copy of all information
- Save, search, and delete addresses
- Export saved addresses to TXT file

### User Experience
- Responsive design for various devices
- Light/Dark theme support

## Deployment

[Cloudflare Deployment](Cloudfare部署教程.md)

Docker Deployment

```bash
docker run -p 3000:3000 guoogaii/ip-geoaddress-generator:latest
```

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/GuooGaii/ip-geoaddress-generator.git
   ```

2. Install dependencies:
   ```bash
   cd ip-geoaddress-generator
   npm install
   ```

3. Run development server:
   ```bash
   npm dev
   ```

## Important Notes

- This project is for educational and entertainment purposes only
- Generated address information is random and should not be used for any actual or legal purposes
- Please comply with API terms of use and limitations

## Contributing

Issues and pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Acknowledgments

Thanks to [F-droid](https://linux.do/u/F-droid/summary) from LinuxDo Forum for providing the [Docker deployment tutorial and image](https://linux.do/t/topic/234815)

Thanks to [HirasawaYui](https://linux.do/u/HirasawaYui/summary) from LinuxDo Forum for providing the GitHub Action

Thanks to the following API services:

- [ipify](https://www.ipify.org/) - IP address detection
- [ipapi](https://ipapi.co/) - IP geolocation information
- [RandomUser](https://randomuser.me/) - Random user information generation
- [OpenStreetMap](https://www.openstreetmap.org/) - Geocoding service
- [Google Maps](https://www.google.com/maps) - Map display service

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Support Me

<img src="支付宝收款码.png" alt="Alipay QR Code" style="width: 50%; max-width: 300px;"/>
