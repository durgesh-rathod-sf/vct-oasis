import React from 'react';
import '../NewProject/NewProject.css';
import uploadLogoIco from "../../assets/newDealsIcons/uploadLogo.svg";
import deleteIco from "../../assets/newDealsIcons/trashdelete.svg";
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';

import { toast } from 'react-toastify';

class S3BucketUpload extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {
      file: null,
    };
  }

  isValidFileSize(file) {
    if (file !== undefined && file !== null) {
      let fileSize = Math.round(file.size / 1024); // filesize in MB
      if (fileSize > 250) {
        return false;
      }
      return true;
    }
    return true;
  }

  isValidFileExtension(file) {
    if (file !== undefined && file !== null) {
      let fileName = file.name;
      let fileExtension = fileName.split('.').pop();
      if (
        fileExtension !== 'png' &&
        fileExtension !== 'jpeg' && fileExtension !== 'PNG' &&
        fileExtension !== 'JPEG'
        // &&
        // fileExtension !== 'svg'
      ) {
        return false;
      }
      return true;
    }
    return true;
  }

  onChange(e) {
    const file = e.target.files[0];
    if (!this.isValidFileSize(file) && !this.isValidFileExtension(file)) {
      const file = document.getElementById('fileInput');
      file.value = '';
      // alert(
      //   "file is too large, maximum supported file size is 250KB and file format allowed is '.png/ .jpeg' "
      // );
      this.showNotification("error", "file is too large, maximum supported file size is 250KB and file format allowed is '.png/ .jpeg' ")
    } else if (!this.isValidFileExtension(file)) {
      const file = document.getElementById('fileInput');
      file.value = '';
      // alert("invalid file format-file format, allowed is '.png/ .jpeg'");
      this.showNotification("error", "invalid file format-file format, allowed is '.png/ .jpeg'")
    } else if (!this.isValidFileSize(file)) {
      const file = document.getElementById('fileInput');
      file.value = '';
      // alert('file is too large, maximum supported file size is 250KB');
      this.showNotification("error", 'file is too large, maximum supported file size is 250KB')
    } else {
      if (file !== undefined && file !== null) {
        this.setState(
          {
            file: file,
          },
          () => {
            this.props.onChange(this.state.file);
          }
        );
      }
    }
  }
  showNotification(type, message) {
    switch (type) {
      case 'error':
        toast.error(<NotificationMessage
          title="Error"
          bodytext={message}
          icon="error"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div style={{ margin: "1% 2% 3% 2%" }}>
        {(this.state.file && this.props.displayFile !== null) ?
          <div className="row" style={{ marginLeft: "0px" }}>
            <div className="logoUpload-box">
              <img src={this.props.displayFile} alt=""
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%"
                }} />
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <img src={deleteIco} alt="deleteIcon" style={{ cursor: this.props.masterMarked ? "not-allowed" : this.props.loader ? 'not-allowed' : 'pointer' }} onClick={this.props.masterMarked ? 'return false;' : this.props.loader ? 'return false;' : this.props.resetFile} />
            </div>
          </div>
          :
          <div style={{ paddingLeft: "2%" }}>
            <label htmlFor="fileInput">
              {/* Replaced 'for' with 'htmlFor' as a valid DOM property*/}
              <div className="row logoUpload-box" style={{ cursor: this.props.masterMarked ? "not-allowed" : this.props.loader ? 'not-allowed' : 'pointer' }}>
                <div style={{ width: "100%", marginTop: "15px" }}>
                  <img src={uploadLogoIco} alt="logo" />
                </div>
                <span className="col-sm-12 uploadText" style={{ marginTop: "10px", marginBottom: "10px" }}>Upload Logo</span>
                <span className="col-sm-12 uploadText" >.png, .jpeg format</span>
                <span className="col-sm-12 uploadText" style={{ marginTop: "5px" }}>less than 250KB</span>
              </div>
            </label>
            <input
              type="file"
              name="file"
              id="fileInput"
              accept="image/png"
              disabled={this.props.masterMarked ? true : this.props.loader ? true : false}
              style={{ height: "32px", opacity: "0", position: "absolute", zIndex: "-1" }}
              onChange={e => this.onChange(e)}
            />
          </div>
        }
        {/* {this.state.file &&
          this.props.displayFile !== null &&
          <div className="row" style={{ textAlign: 'center', marginTop: '3%' }}>
            <div className="col-sm-3">
               </div>
            <div className="col-sm-3">
              <button
                type="button"
                style={{ width: '60%' }}
                className="file uploadBtn btn btn-light template-button"
                onClick={this.props.resetFile}
              >
                Discard
              </button>
            </div>
          </div>} */}
        {/* <br /> */}
        {/* <img src={this.props.displayFile}  /> */}
      </div>
    );
  }
}
export default S3BucketUpload;
