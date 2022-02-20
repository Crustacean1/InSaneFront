
interface SetOptionDto {
    optionId: number;
    value: string;
}

interface GetOptionDto {
    optionId: string;
    title: string;
    desc: string;
    value: string;
    value_range: string[];
    type: string;
    constraint: string;
    unit: string;
}

interface ScanStatus {
    progress: number;
    status: "Ready" | "Scanning" | "Completed" | "Failed" | "Writing" | "Initializing";
}

interface FetchOptions {
    method: string;
    mode: RequestMode | undefined;
    cache: RequestCache | undefined;
    headers: any;
    redirect: RequestRedirect | undefined;
    body: any;
}

class Api {
    apiEndpoint: string;
    httpOk: number;

    constructor() {
        const envApiEndpoint = process.env.REACT_APP_API_ENDPOINT;
        if (!envApiEndpoint) {
            throw "Failed to specify endpoint url (did you forget to set 'REACT_APP_API_ENDPOINT'?";
        }
        this.apiEndpoint = envApiEndpoint;
        this.httpOk = 200;
    }

    getOptions(selectedMethod: string, data: any): FetchOptions {
        return {
            method: selectedMethod,
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            redirect: "follow",
            body: (data && Object.keys(data).length !== 0) ? JSON.stringify(data) : null
        }
    }

    getDownloadLink(scannerName: string): string {
        return this.apiEndpoint + "/scan/" + encodeURIComponent(scannerName);
    }

    callApi(endpoint: string, method: string, reqBody: any = {}): Promise<object> {
        return fetch(this.apiEndpoint + endpoint, this.getOptions(method, reqBody)).then(
            (data) => {
                const jsonData = data.json();
                if (data.status !== this.httpOk) {
                    if ("details" in jsonData) {
                        Promise.reject(jsonData);
                    }
                    Promise.reject({ "details": `Received code ${data.status} from api` });
                }
                return jsonData;
            });
    }

    fetchScannerList(): Promise<string[]> {
        return this.callApi("/scanners/", "GET")
            .then((data: any) => {
                if ("devices" in data) {
                    return data["devices"];
                } else {
                    return [] as string[];
                }
            });
    }

    refreshScannerList(): Promise<boolean> {
        return this.callApi("/scanners/", "POST")
            .then((data: any) => {
                if ("status" in data) {
                    return data["status"] === "success";
                }
                return false;
            });
    }

    getScannerOptions(scannerName: string): Promise<GetOptionDto[]> {
        return this.callApi("/scanners/" + encodeURIComponent(scannerName), "GET")
            .then((data: any) => {
                if ("options" in data) {
                    return data;
                }
                Promise.reject("Invalid api response");
            })
    }

    setScannerOption(scannerName: string, option: SetOptionDto | {}): Promise<boolean> {
        return this.callApi("/scanners/" + encodeURIComponent(scannerName), "PUT", option)
            .then((data: any) => {
                if ("status" in data) {
                    return data["status"] === "success";
                }
                return false;
            });
    }

    startScanning(scannerName: string): Promise<boolean> {
        return this.callApi("/scan/" + encodeURIComponent(scannerName), "POST")
            .then((data: any) => {
                if ("status" in data) { return data["status"] === "success"; }
                return Promise.reject("Invalid object received from api");
            });
    }

    getScanStatus(scannerName: string): Promise<ScanStatus> {
        return this.callApi("/scan/status/" + encodeURIComponent(scannerName), "GET")
            .then((data: any) => {
                if ("progress" in data && "status" in data) { return data as ScanStatus; }
                return Promise.reject("Invalid object received from api");
            });
    }
}

const apiFetcher = new Api();

export default apiFetcher;
export type { GetOptionDto, SetOptionDto, ScanStatus };