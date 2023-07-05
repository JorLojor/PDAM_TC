const response_error = (data,res,err)=>{
   res.json({
    message: "terjadi kesalahan",
    data : data,
    error : err
});
}

module.exports= response_error
