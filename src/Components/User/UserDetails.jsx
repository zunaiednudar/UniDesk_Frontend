import {useParams} from "react-router";

const UserDetails = () => {
    const {id} = useParams();
    console.log("User id (UserDetails.jsx): ", id);
}

export default UserDetails;