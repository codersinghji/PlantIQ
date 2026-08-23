import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Equipment.css";

import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Cpu,
    Filter,
    MapPin,
    RefreshCw,
    Search,
    Wrench,
    ArrowRight,
} from "lucide-react";

import { getAllEquipment } from "../services/api";


function Equipment() {

    const navigate = useNavigate();

    const [equipment, setEquipment] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");


    /* =========================================
       LOAD EQUIPMENT
    ========================================= */

    const loadEquipment = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getAllEquipment();

            console.log("Equipment API Response:", data);

            if (data.success) {

                setEquipment(data.equipment || []);

            } else {

                setError(
                    data.message ||
                    "Unable to load equipment."
                );

            }

        } catch (error) {

            console.error(
                "Equipment API Error:",
                error
            );

            if (error.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Unable to connect to the equipment server."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadEquipment();

    }, []);


    /* =========================================
       STATUS NORMALIZATION
    ========================================= */

    const getStatus = (item) => {

        return String(
            item.status || "Unknown"
        ).toLowerCase();

    };


    /* =========================================
       FILTER EQUIPMENT
    ========================================= */

    const filteredEquipment = useMemo(() => {

        return equipment.filter((item) => {

            const searchText =
                search.trim().toLowerCase();


            const matchesSearch =
                !searchText ||

                item.name
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.equipmentCode
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.type
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.location
                    ?.toLowerCase()
                    .includes(searchText);


            const matchesStatus =
                statusFilter === "All" ||

                getStatus(item) ===
                statusFilter.toLowerCase();


            return (
                matchesSearch &&
                matchesStatus
            );

        });

    }, [
        equipment,
        search,
        statusFilter
    ]);


    /* =========================================
       COUNTS
    ========================================= */

    const totalEquipment =
        equipment.length;


    const running =
    equipment.filter(
        (item) =>
            item.status === "Running"
    ).length;

const stopped =
    equipment.filter(
        (item) =>
            item.status === "Stopped"
    ).length;

const maintenance =
    equipment.filter(
        (item) =>
            item.status === "Maintenance"
    ).length;

    /* =========================================
       STATUS ICON
    ========================================= */

    const getStatusIcon = (status) => {

        const value =
            String(status)
                .toLowerCase();


        if (value === "healthy") {

            return (
                <CheckCircle2 size={15} />
            );

        }


        if (value === "warning") {

            return (
                <AlertTriangle size={15} />
            );

        }


        if (value === "critical") {

            return (
                <AlertTriangle size={15} />
            );

        }


        return (
            <Activity size={15} />
        );

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="equipment-state">

                <div className="equipment-state-icon">

                    <RefreshCw
                        size={28}
                        className="loading-spinner"
                    />

                </div>

                <h2>
                    Loading equipment
                </h2>

                <p>
                    Fetching equipment from the plant monitoring system...
                </p>

            </div>

        );

    }


    /* =========================================
       ERROR
    ========================================= */

    if (error) {

        return (

            <div className="equipment-state error">

                <div className="equipment-state-icon error-icon">

                    <AlertTriangle size={28} />

                </div>

                <h2>
                    Equipment unavailable
                </h2>

                <p>
                    {error}
                </p>

                <button
                    className="equipment-retry"
                    onClick={loadEquipment}
                >

                    <RefreshCw size={16} />

                    Try Again

                </button>

            </div>

        );

    }


    return (

        <div className="equipment-page">


            {/* =====================================
                HEADER
            ===================================== */}

            <div className="equipment-page-header">

                <div>

                    <span className="equipment-eyebrow">
                        PLANT MONITORING
                    </span>

                    <h1>
                        Equipment
                    </h1>

                    <p>
                        Monitor and manage all registered
                        plant equipment.
                    </p>

                </div>


                <button
                    className="equipment-refresh"
                    onClick={loadEquipment}
                >

                    <RefreshCw size={17} />

                    Refresh

                </button>

            </div>


            {/* =====================================
                SUMMARY CARDS
            ===================================== */}

             <div className="equipment-summary-card">

              <div className="equipment-summary-icon green">
               <Activity size={21} />
           </div>

          <div>
              <span>Running</span>

           <strong>{running}</strong>

             <small>
               Currently operating
            </small>
    </div>

</div>


        <div className="equipment-summary-card">

          <div className="equipment-summary-icon gray">
        <Activity size={21} />
         </div>

        <div>
            <span>Stopped</span>
   
             <strong>{stopped}</strong>

           <small>
                Not currently running
           </small>
       </div>

     </div>


          <div className="equipment-summary-card">

              <div className="equipment-summary-icon yellow">
                <Wrench size={21} />
                 </div>

                 <div>
                  <span>Maintenance</span>

                  <strong>{maintenance}</strong>

               <small>
                 Under maintenance
                   </small>
                 </div>

                </div> 


            {/* =====================================
                SEARCH / FILTER
            ===================================== */}

            <div className="equipment-toolbar">


                <div className="equipment-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search by name, code, type or location..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="equipment-filter">

                    <Filter size={17} />

                      <select
    value={statusFilter}
    onChange={(event) =>
        setStatusFilter(event.target.value)
    }
>
    <option value="All">
        All Status
    </option>

    <option value="Running">
        Running
    </option>

    <option value="Stopped">
        Stopped
    </option>

    <option value="Maintenance">
        Maintenance
    </option>
</select>

                </div>

            </div>


            {/* =====================================
                RESULT COUNT
            ===================================== */}

            <div className="equipment-result-info">

                <span>
                    Showing{" "}
                    <strong>
                        {filteredEquipment.length}
                    </strong>{" "}
                    of{" "}
                    <strong>
                        {equipment.length}
                    </strong>{" "}
                    equipment
                </span>

            </div>


            {/* =====================================
                EMPTY STATE
            ===================================== */}

            {filteredEquipment.length === 0 ? (

                <div className="equipment-empty">

                    <div className="equipment-empty-icon">

                        <Search size={25} />

                    </div>

                    <h2>
                        No equipment found
                    </h2>

                    <p>
                        Try changing your search or
                        status filter.
                    </p>

                </div>

            ) : (


                /* =================================
                   EQUIPMENT GRID
                ================================= */

                <div className="equipment-grid">

                    {filteredEquipment.map((item) => {

                        const status =
                            getStatus(item);


                        return (

                            <div
                                className="equipment-card"
                                key={item._id}
                                onClick={() =>
                                    navigate(
                                        `/equipment/${item._id}`
                                    )
                                }
                            >


                                {/* CARD TOP */}

                                <div className="equipment-card-top">

                                    <div className="equipment-machine-icon">

                                        <Cpu size={22} />

                                    </div>


                                    <div
                                        className={
                                            `equipment-status ${status}`
                                        }
                                    >

                                        {getStatusIcon(
                                            item.status
                                        )}

                                        <span>
                                            {item.status}
                                        </span>

                                    </div>

                                </div>


                                {/* EQUIPMENT NAME */}

                                <div className="equipment-card-title">

                                    <h2>
                                        {item.name}
                                    </h2>

                                    <span>
                                        {item.equipmentCode}
                                    </span>

                                </div>


                                {/* DETAILS */}

                                <div className="equipment-details">


                                    <div className="equipment-detail">

                                        <Wrench size={16} />

                                        <div>

                                            <span>
                                                Equipment Type
                                            </span>

                                            <strong>
                                                {item.type}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="equipment-detail">

                                        <MapPin size={16} />

                                        <div>

                                            <span>
                                                Location
                                            </span>

                                            <strong>
                                                {item.location}
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* FOOTER */}

                                <div className="equipment-card-footer">

                                    <span>
                                        View machine details
                                    </span>

                                    <ArrowRight
                                        size={17}
                                    />

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}


export default Equipment;