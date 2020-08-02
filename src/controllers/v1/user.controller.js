const get = async (req, res, next) => {
  try {
    return res.json({message: 'users get'})
  } catch (e) {
    next(e)
  }
}

export {
  get
}
