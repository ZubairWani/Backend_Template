

const GlobalUploadImage = async (req, res) => {
    // #swagger.tags = ['Media']
    try {
        if (req.file.azureBlobUrl) return res.status(200).json({ success: true, message: "Image Uploaded Successfully", url: req.file.azureBlobUrl })
        else return res.status(400).json({ success: false, message: "Somthing Went Wrong while uploading the Image." })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

module.exports = {
    GlobalUploadImage
}