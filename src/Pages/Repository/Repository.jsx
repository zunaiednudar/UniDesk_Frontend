import React from 'react';
import {useParams} from "react-router";

const Repository = () => {
    const {id} = useParams();

    return (
        <div>
            {/* stats if user is logged in */}
            {id && (
                <div>
                    {id}
                </div>
            )}

        </div>
    );
};

export default Repository;