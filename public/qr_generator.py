import qrcode

qr=qrcode.QRCode(border=5, box_size=11)
qr.add_data('https://tweetnfts.xyz')
qr.make(fit=True)
img = qr.make_image(fill_color="white", back_color="gray")
img.save("qr_tweetnftsWebsite")

