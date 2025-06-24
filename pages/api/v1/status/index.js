function status(request, response) {
  response.status(200).json({ status: "tudo certo" });
}

export default status;
