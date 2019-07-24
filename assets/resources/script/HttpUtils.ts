export class HttpUtils {
    private static xhr: XMLHttpRequest;

    public static Request(params) {
        params = params || {};
        params.data = params.data || {};
        var json = params.jsonp ? HttpUtils.jsonp(params) : HttpUtils.json(params);


    };
    private static json(params) {
        params.type = (params.type || 'GET').toUpperCase();
        this.xhr = this.xhr || new XMLHttpRequest();
        if (params.type == "GET") {
            params.data = this.formatParams(params.data)
            this.xhr.open(params.type, params.url + "?" + params.data, params.async || true);
            this.xhr.send(null);
        } else if (params.type == "POST") {
            // params.data = this.formatParams(params.data)
            this.xhr.open(params.type, params.url, params.async || true);
            this.xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            // this.xhr.send(params.data)
            this.xhr.send(JSON.stringify(params.data))
        }
        // this.xhr.withCredentials=true;
        this.xhr.onreadystatechange = function (that, ev) {
            if (this.xhr.readyState == 4) {
                if (this.xhr.status >= 200 && this.xhr.status < 300) {
                    var response = '';
                    // 判断接受数据的内容类型
                    var type = this.xhr.getResponseHeader('Content-type');
                    if (type && type.indexOf('xml') !== -1 && this.xhr.responseXML) {
                        response = this.xhr.responseXML; //Document对象响应 
                    } else if (type === 'application/json') {
                        response = JSON.parse(this.xhr.responseText); //JSON响应 
                    } else {
                        response = this.xhr.responseText; //字符串响应 
                    };
                    params.success && params.success(response);
                } else {
                    params.errer && params.errer(this.xhr.status);

                }
            }
        }.bind(this)


    }

    private static jsonp(params) {

    }
    public static formatParams(data) {
        var arr = [];
        for (var name in data) {
            // encodeURIComponent() ：用于对 URI 中的某一部分进行编码
            arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        };
        // 添加一个随机数参数，防止缓存 
        arr.push('v=' + Math.floor(Math.random() * 10000 + 500));
        return arr.join('&');
    }
}
