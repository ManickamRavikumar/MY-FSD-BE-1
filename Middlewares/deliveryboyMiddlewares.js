export const isDeliveryBoy = (req, res, next) => {
    if (req.user.role !== 'Delivery') {
        return res.status(403).json({ message: 'Only delivery staff can access this resource.' });
    }
    next();
};