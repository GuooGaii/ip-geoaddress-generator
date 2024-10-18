<div align="center">

[简体中文](README.md) | [English](README_EN.md)

</div>

# IP-Based Real Address Generator 🌍

This is a web-based application that generates realistic random address information based on IP addresses. It utilizes multiple APIs to obtain location data and random user information, providing users with a complete virtual identity.

## Access Address

https://ip-geoaddress-generator.pages.dev/

## Main Features

### Address Generation
- Automatic generation based on current IP address detection
- Support for manual IP input or custom region selection
- Generation of complete random address information
  - Name
  - Phone number
  - Country
  - State/Province
  - City
  - SSN (Only for USA)

### Address Management
- Display generated addresses on Google Maps
- One-click copy of various information
- Save, search, and delete addresses
- Export saved addresses to TXT file

### User Experience
- Responsive design, compatible with various devices
- Support for light/dark theme switching

## Deployment

[Cloudflare Deployment](Cloudflare_Deployment_Guide.md)

[Docker Deployment](https://linux.do/t/topic/234815)

Special thanks to [F-droid](https://linux.do/u/F-droid/summary) from the LinuxDo forum for providing the Docker deployment tutorial and image.

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/GuooGaii/ip-geoaddress-generator.git
   ```

2. Install dependencies:
   ```bash
   cd ip-geoaddress-generator
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open `http://localhost:3000` in your browser

## Notes

- This project is for educational and entertainment purposes only
- The generated address information is random and should not be used for any actual or legal purposes
- Please comply with API usage terms and limitations

## Contributing

Issues and pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Support Me

<img src="支付宝收款码.png" alt="支付宝收款码" style="width: 50%; max-width: 300px;"/>