import React from "react";

const SearchSection = () => {
  return (
    <section className="ftco-section ftco-no-pb ftco-no-pt">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="ftco-search d-flex justify-content-center">
              <div className="row">
                <div className="col-md-12 nav-link-wrap">
                  <div
                    className="nav nav-pills text-center"
                    id="v-pills-tab"
                    role="tablist"
                    aria-orientation="vertical"
                  >
                    <a
                      className="nav-link active mr-md-1"
                      id="v-pills-1-tab"
                      data-toggle="pill"
                      href="#v-pills-1"
                      role="tab"
                      aria-controls="v-pills-1"
                      aria-selected="true"
                    >
                      Search Flights
                    </a>

                    <a
                      className="nav-link mr-md-1"
                      id="v-pills-2-tab"
                      data-toggle="pill"
                      href="#v-pills-2"
                      role="tab"
                      aria-controls="v-pills-2"
                      aria-selected="false"
                    >
                      Hotel
                    </a>

                    <a
                      className="nav-link"
                      id="v-pills-3-tab"
                      data-toggle="pill"
                      href="#v-pills-3"
                      role="tab"
                      aria-controls="v-pills-3"
                      aria-selected="false"
                    >
                      Transportation
                    </a>
                  </div>
                </div>

                <div className="col-md-12 tab-wrap">
                  <div className="tab-content" id="v-pills-tabContent">
                    {/* Tab 1: Search Flight */}
                    <div
                      className="tab-pane fade show active"
                      id="v-pills-1"
                      role="tabpanel"
                      aria-labelledby="v-pills-1-tab"
                    >
                      <form action="/tourist/book-flight" className="search-property-1">
                        <div className="row no-gutters">
                          <div className="col-md d-flex">
                            <div className="form-group p-4 border-0">
                              <label htmlFor="#">Origin</label>
                              <div className="form-field">
                                <div className="icon">
                                  <span className="fa fa-search"></span>
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Search place"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4 border-0">
                              <label htmlFor="#">Destination</label>
                              <div className="form-field">
                                <div className="icon">
                                  <span className="fa fa-search"></span>
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Search place"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#"> Date</label>
                              <div className="form-field">
                                <div className="icon">
                                  <span className="fa fa-calendar"></span>
                                </div>
                                <input
                                  type="text"
                                  className="form-control checkout_date"
                                  placeholder="Flight Date"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#">Guests</label>
                              <div className="form-field">
                                <input
                                  type="number"
                                  className="form-control p-0"
                                  placeholder="Guests" 
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group d-flex w-100 border-0">
                              <div className="form-field w-100 align-items-center d-flex">
                                <input
                                  type="submit"
                                  value="Search"
                                  className="align-self-stretch form-control btn btn-primary"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Tab 2: Hotel */}
                    <div
                      className="tab-pane fade"
                      id="v-pills-2"
                      role="tabpanel"
                      aria-labelledby="v-pills-2-tab"
                    >
                      <form action="/tourist/book-hotel" className="search-property-1">
                        <div className="row no-gutters">
                          <div className="col-md d-flex">
                            <div className="form-group p-4 border-0">
                              <label htmlFor="#">Destination</label>
                              <div className="form-field">
                                <div className="icon">
                                  <span className="fa fa-search"></span>
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Search place"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#">Check-in date</label>
                              <div className="form-field">
                                <div className="icon">
                                  <span className="fa fa-calendar"></span>
                                </div>
                                <input
                                  type="text"
                                  className="form-control checkin_date"
                                  placeholder="Check In Date"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#">Check-out date</label>
                              <div className="form-field">
                                <div className="icon">
                                  <span className="fa fa-calendar"></span>
                                </div>
                                <input
                                  type="text"
                                  className="form-control checkout_date"
                                  placeholder="Check Out Date"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#">Guests</label>
                              <div className="form-field">
                                <input
                                  type="number"
                                  className="form-control p-0"
                                  placeholder="Guests" 
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#">Rooms</label>
                              <div className="form-field">
                                <input
                                  type="number"
                                  className="form-control p-0"
                                  placeholder="Rooms" 
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group d-flex w-100 border-0">
                              <div className="form-field w-100 align-items-center d-flex">
                                <input
                                  type="submit"
                                  value="Search"
                                  className="align-self-stretch form-control btn btn-primary"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Tab 3: Transportation */}
                    <div
                      className="tab-pane fade"
                      id="v-pills-3"
                      role="tabpanel"
                      aria-labelledby="v-pills-3-tab"
                    >
                      <form action="/tourist/book-transportation" className="search-property-1">
                        <div className="row no-gutters">
                        <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#">Vehichle Type</label>
                              <div className="form-field">
                                <div className="select-wrap">
                                  <div className="icon">
                                    <span className="fa fa-chevron-down"></span>
                                  </div>
                                  <select
                                    name=""
                                    id=""
                                    className="form-control"
                                  >
                                    <option value="">All Types</option>
                                    <option value="">Car</option>
                                    <option value="">Van</option>
                                    <option value="">Bus</option>
                                    <option value="">Mini Bus</option>
                                    <option value="">Limousine</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#">From</label>
                              <div className="form-field">
                                <div className="icon">
                                  <span className="fa fa-calendar"></span>
                                </div>
                                <input
                                  type="text"
                                  className="form-control checkin_date"
                                  placeholder="Departure Date"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#">To</label>
                              <div className="form-field">
                                <div className="icon">
                                  <span className="fa fa-calendar"></span>
                                </div>
                                <input
                                  type="text"
                                  className="form-control checkout_date"
                                  placeholder="Arrival Date"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#">Price Range</label>
                              <div className="form-field">
                                <div className="select-wrap">
                                  <div className="icon">
                                    <span className="fa fa-chevron-down"></span>
                                  </div>
                                  <select
                                    name=""
                                    id=""
                                    className="form-control"
                                  >
                                    <option value="">All prices</option>
                                    <option value="">$0-$50</option>
                                    <option value="">$51-$100</option>
                                    <option value="">$101-$200</option>
                                    <option value="">$201-$500</option>
                                    <option value="">$501+</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group p-4">
                              <label htmlFor="#">Passengers</label>
                              <div className="form-field">
                                <input
                                  type="number"
                                  className="form-control p-0 "
                                  placeholder="Passengers" 
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md d-flex">
                            <div className="form-group d-flex w-100 border-0">
                              <div className="form-field w-100 align-items-center d-flex">
                                <input
                                  type="submit"
                                  value="Search"
                                  className="align-self-stretch form-control btn btn-primary"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
