/**
 * PageModel<T>
 * @description
 * is the model of a page of data of type T (T extends object)
 * This class have 3 high complex methods. They are: factory, fromBuilderData and fromAsyncBuilderData
 * These methods are used to create a PageModel from a list of objects each with its particularities but
 * with the same structure.
 * The general algorithm for these methods is
 * 1. Verify if the data its empty if so return an empty page (NIL PAGE)
 * 2. Map the firstObject of the data to a T object
 * 3. Set Keys of keys passed opitionally or the keys of the firstObject
 *  Set length of the page to the length passed optionally or the length of the data
 *  Set values as a empty array
 * 4. Define a variable to calculate the true length of items
 * 5. Map the firstObject to an array of your values
 * 6. If the values of the firstObject are not empty push the values of to the values of the page and
 * increment the true length of items
 * 7. Map the rest of the data to an array of your values
 * The interation happens two elements at a time current and next
 * 8. if  next are empty get values from the current object and push them to the values of the page
 * and increment the true length of items at last break iteration
 * 9. if next are not empty get an pair of values from the current and next object and push them to the values of the page
 * and increment the true length of items in 2
 * 10. At end of the iteration if length is even number
 *   get the last value of the current object and push it to the values of the page if the value is not empty
 *  and increment the true length of items
 * 11. in the end return a new instance of PageModel with the keys, values and length = true length of items
 *
 *
 *

 * @class PageModel
 * @template T - Type of the data of the page
 */
class PageModel {
    /**
     * Creates an instance of PageModel.
     * @param {PageProperties<T>} data - Data of the page
     * @param {number} length - Length of the page
     * @memberof PageModel
     */
    constructor(data, length) {
        this.data = data;
        this.length = length;
    }
    /**
     * get the data of the page as an object
     *
     * @return {*}  {object}
     * @memberof PageModel
     */
    getData() {
        return { keys: this.data.keys, values: this.data.values };
    }
    /**
     * get the values of the page
     *
     * @return {*}  {ValuesType<T>}
     * @memberof PageModel
     */
    getValues() {
        return this.data.values;
    }
    /**
     * get the keys of the page
     *
     * @return {*}  {KeysOfT<T>}
     * @memberof PageModel
     */
    getKeys() {
        return this.data.keys;
    }
    /**
     * Get the item at the given index of the page as an object
     *
     * @param {number} index
     * @return {*}  {T}
     * @memberof PageModel
     */
    at(index) {
        if (index < 0) {
            // eslint-disable-next-line no-param-reassign
            index = this.data.values.length + index;
        }
        const item = {};
        for (const [i, key] of this.data.keys.entries()) {
            item[key] = this.data.values[index][i];
        }
        return item;
    }
    /**
     * Map the page to another type of page with the given callback function
     *
     * @template S - Type of the mapped page
     * @param {(value: T, index: number) => S} callbackfn - Callback function to map the page
     * @return {*}  {PageModel<S>}
     * @memberof PageModel
     */
    map(callbackfn) {
        const mappedValues = this.data.values.map((itemValues, index) => {
            const item = this.at(index);
            return Object.values(callbackfn(item, index));
        });
        const keys = Object.keys(callbackfn(this.at(0), 0));
        return new PageModel({ keys, values: mappedValues }, this.length);
    }
    /**
     * Map the page to another type of page with the given async callback function
     *
     *
     * @template S - Type of the mapped page
     * @param {(value: T, index: number) => Promise<S>} callbackfn - Callback function to map the page
     * @return {*}  {Promise<PageModel<S>>}
     * @memberof PageModel
     */
    async asyncMap(callbackfn) {
        const mappedValues = [];
        for (let index = 0; index < this.length; index += 1) {
            const item = this[index];
            const value = await callbackfn(item, index);
            mappedValues.push(value);
        }
        const keys = Object.keys(callbackfn(this.at(0), 0));
        return new PageModel({ keys, values: mappedValues }, this.length);
    }
    /**
     * Get the page as a list of objects
     *
     * @readonly
     * @type {T[]}
     * @memberof PageModel
     */
    get asList() {
        const list = [];
        for (let i = 0; i < this.length; i += 1) {
            list.push(this.at(i));
        }
        return list;
    }
    /**
     * Factory method to build a page model from a list of objects of type T (T extends object)
     *
     * @static
     * @template T - Type of the data of the page
     * @param {T[]} data - Data of the page
     * @param {BuildOptionalData<T>} [optional] - Optional data to build the page
     * @return {*}  {PageModel<T>}
     * @memberof PageModel
     */
    static factory(data, optional) {
        if (data[0] === undefined) {
            return PageModel.NIL_PAGE();
        }
        if (data[0] === undefined) {
            return PageModel.NIL_PAGE();
        }
        const haveOnlyOneElement = data[0] !== undefined && data[1] === undefined;
        if (haveOnlyOneElement) {
            return PageModel.oneItemPageSync((e) => e, data, optional);
        }
        let trueLength = 0;
        // but if the data are more than one, we need to build the page
        // iterate over the data to build the page
        const firstObject = data[0];
        const { keys, length, values } = PageModel.getPageParameters(firstObject, data, optional);
        const firstValues = PageModel.getValuesFromOneObject(keys, firstObject);
        if (firstValues.length > 0) {
            values.push(firstValues);
            trueLength += 1;
        }
        for (let currentIndex = 1; currentIndex < length; currentIndex += 2) {
            const nextIndex = currentIndex + 1;
            const current = data[currentIndex];
            // add current to the page
            const currentValues = PageModel.getValuesFromOneObject(keys, current);
            if (currentValues.length > 0) {
                values.push(currentValues);
                trueLength += 1;
            }
            if (nextIndex < length) {
                const next = data[nextIndex];
                // add next to the page
                const nextValues = PageModel.getValuesFromOneObject(keys, next);
                if (nextValues.length > 0) {
                    values.push(nextValues);
                    trueLength += 1;
                }
            }
        }
        return new PageModel({ keys, values }, trueLength);
    }
    /**
     * Factory method to build a page model from a list of objects of type T (T extends object) using a builder function to build the data from the given data
     *
     * @static
     * @template T - Type of the data of the page
     * @template S - Type of the data to build the page
     * @param {(data: S) => T} builderData - Builder function to build the data of the page
     * @param {S[]} data - Data to build the page
     * @param {{
     *       keys?: KeysOfT<T>
     *       length?: number
     *     }} [optional] - Optional data to build the page
     * @return {*}  {PageModel<T>} - Page model
     * @memberof PageModel
     */
    static fromBuilderData(builderData, data, optional) {
        if (data[0] === undefined) {
            return PageModel.NIL_PAGE();
        }
        const haveOnlyOneElement = data[0] !== undefined && data[1] === undefined;
        if (haveOnlyOneElement) {
            return PageModel.oneItemPageSync(builderData, data, optional);
        }
        let trueLength = 0;
        // but if the data are more than one, we need to build the page
        // iterate over the data to build the page
        const firstObject = builderData(data[0]);
        const { keys, length, values } = PageModel.getPageParameters(firstObject, data, optional);
        const firstValues = PageModel.getValuesFromOneObject(keys, firstObject);
        if (firstValues.length > 0) {
            values.push(firstValues);
            trueLength += 1;
        }
        for (let currentIndex = 1; currentIndex < length; currentIndex += 2) {
            const nextIndex = currentIndex + 1;
            const current = builderData(data[currentIndex]);
            // add current to the page
            const currentValues = PageModel.getValuesFromOneObject(keys, current);
            if (currentValues.length > 0) {
                values.push(currentValues);
                trueLength += 1;
            }
            if (nextIndex < length) {
                const next = builderData(data[nextIndex]);
                // add next to the page
                const nextValues = PageModel.getValuesFromOneObject(keys, next);
                if (nextValues.length > 0) {
                    values.push(nextValues);
                    trueLength += 1;
                }
            }
        }
        return new PageModel({ keys, values }, trueLength);
    }
    /**
     * Factory method to build a page model from a list of objects of type T (T extends object) using an async builder function to build the data from the given data
     * The async builder function is called for each data of the list
     * The page is built when all the data are built
     *
     * @static
     * @template T - Type of the data of the page
     * @template S - Type of the data to build the page
     * @param {(data: S) => Promise<T>} asyncBuilderData - Async builder function to build the data of the page
     * @param {S[]} data - Data to build the page
     * @param {{
     *       keepSort?: boolean
     *       length?: number
     *       keys?: KeysOfT<T>
     *     }} [optional] - Optional data to build the page
     * @return {*}  {Promise<PageModel<T>>} - Page model
     * @memberof PageModel
     */
    // eslint-disable-next-line complexity
    static async fromAsyncBuilderData(asyncBuilderData, data, optional) {
        if (data[0] === undefined) {
            return PageModel.NIL_PAGE();
        }
        const haveOnlyOneElement = data[0] !== undefined && data[1] === undefined;
        // check if the data are only one and if it is the case, return a page with only one data
        if (haveOnlyOneElement) {
            return PageModel.oneItemPageAsync(asyncBuilderData, data, optional);
        }
        let trueLength = 0;
        // but if the data are more than one, we need to build the page
        // iterate over the data to build the page
        const firstObject = await asyncBuilderData(data[0]);
        const { keys, length, values } = PageModel.getPageParameters(firstObject, data, optional);
        const firstValues = PageModel.getValuesFromOneObject(keys, firstObject);
        if (firstValues.length > 0) {
            values.push(firstValues);
            trueLength += 1;
        }
        // iterate over the data to build the page
        // interate using next index
        for (let currentIndex = 1; currentIndex < length; currentIndex += 2) {
            // iterate with current and next index
            const nextIndex = currentIndex + 1;
            const current = await asyncBuilderData(data[currentIndex]);
            // add current to the page
            const currentValues = PageModel.getValuesFromOneObject(keys, current);
            if (currentValues.length > 0) {
                values.push(currentValues);
                trueLength += 1;
            }
            if (nextIndex < length) {
                const next = await asyncBuilderData(data[nextIndex]);
                // add next to the page
                const nextValues = PageModel.getValuesFromOneObject(keys, next);
                if (nextValues.length > 0) {
                    values.push(nextValues);
                    trueLength += 1;
                }
            }
        }
        return new PageModel({ keys, values }, trueLength);
    }
    static async oneItemPageAsync(asyncBuilderData, data, optional) {
        const firstObject = await asyncBuilderData(data[0]);
        const { keys, values } = PageModel.getPageParameters(firstObject, data, optional);
        const firstValues = PageModel.getValuesFromOneObject(keys, firstObject);
        if (firstValues.length > 0) {
            values.push(firstValues);
        }
        return new PageModel({ keys, values }, 1);
    }
    static oneItemPageSync(builderData, data, optional) {
        const firstObject = builderData(data[0]);
        const { keys, values } = PageModel.getPageParameters(firstObject, data, optional);
        const firstValues = PageModel.getValuesFromOneObject(keys, firstObject);
        if (firstValues.length > 0) {
            values.push(firstValues);
        }
        return new PageModel({ keys, values }, 1);
    }
    static getPageParameters(firstObject, data, optional) {
        var _a;
        const keys = PageModel.getObjectKeys(firstObject, optional);
        const values = [];
        const length = (_a = optional === null || optional === void 0 ? void 0 : optional.length) !== null && _a !== void 0 ? _a : data.length;
        return { length, keys, values };
    }
    static getObjectKeys(object, optional) {
        var _a;
        return (_a = optional === null || optional === void 0 ? void 0 : optional.keys) !== null && _a !== void 0 ? _a : Object.keys(object);
    }
    static getValuesFromOneObject(keys, last) {
        if (!last)
            return [];
        const lastValues = [];
        for (const key of keys) {
            lastValues.push(last[key]);
        }
        return lastValues;
    }
    static NIL_PAGE() {
        return new PageModel({
            keys: [],
            values: [],
        }, 0);
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
class PerformaticPaginationModel {
    /**
     * Creates an instance of PerformaticPaginationModel.
     *
     * @param {PageModel<T>} data
     * @param {number} total
     * @param {number} take
     * @param {number} skip
     * @memberof PerformaticPaginationModel
     */
    constructor(data, total, take, skip) {
        this.total = total;
        this.take = take;
        this.skip = skip;
        this.page = data;
    }
    /**
     * Factory method to create a PerformaticPaginationModel from a list of objects
     * and a builder function
     * @static
     * @template T extends object - Type of the object to be built
     * @template S - Type of the object to be used as origin
     * @param {number} total
     * @param {number} take
     * @param {number} skip
     * @param {S[]} data
     * @param {(origin: S) => T} builderData
     * @param {{
     *       keys?: (keyof T)[]
     *     }} [optional]
     * @return {*}  {PerformaticPaginationModel<T>}
     * @memberof PerformaticPaginationModel
     */
    static fromBuilders(total, take, skip, data, builderData, optional) {
        return new PerformaticPaginationModel(PageModel.fromBuilderData(builderData, data, {
            keys: optional === null || optional === void 0 ? void 0 : optional.keys,
            length: take,
        }), total, take, skip);
    }
    /**
     * Factory method to create a PerformaticPaginationModel from a list of objects
     * and a builder asyncronous function (Promise)
     *
     * @static
     * @template S - Type of the object to be used as origin
     * @template T - Type of the object to be built
     * @param {number} total
     * @param {S[]} data
     * @param {(origin: S) => Promise<T>} asyncBuilderData - Asyncronous function to build the object
     * @param {number} [take]
     * @param {number} [skip]
     * @param {{
     *       keys?: (keyof T)[]
     *     }} [optional]
     * @return {*}  {Promise<PerformaticPaginationModel<T>>}
     * @memberof PerformaticPaginationModel
     */
    static async fromAsyncBuilder(total, data, asyncBuilderData, take, skip, optional) {
        return new PerformaticPaginationModel(await PageModel.fromAsyncBuilderData(asyncBuilderData, data, {
            length: take,
            keys: optional === null || optional === void 0 ? void 0 : optional.keys,
        }), total, take !== null && take !== void 0 ? take : total, skip !== null && skip !== void 0 ? skip : 0);
    }
    static fromData(data) {
        return new PerformaticPaginationModel(new PageModel(data.page.data, data.take), data.total, data.take, data.skip);
    }
    /**
     * Factory method to create a PerformaticPaginationModel from a list of objects
     *
     * @static
     * @template T
     * @param {T[]} data
     * @param {number} total
     * @param {number} take
     * @param {number} skip
     * @param {{
     *       keys?: (keyof T)[]
     *     }} [optional]
     * @return {*}  {PerformaticPaginationModel<T>}
     * @memberof PerformaticPaginationModel
     */
    static build(data, total, take, skip, optional) {
        return new PerformaticPaginationModel(PageModel.factory(data, {
            keys: optional === null || optional === void 0 ? void 0 : optional.keys,
            length: take,
        }), total, take, skip);
    }
    /**
     * Returns the item at the specified index
     *
     * @param {number} index
     * @return {*}  {T}
     * @memberof PerformaticPaginationModel
     */
    at(index) {
        return this.page.at(index);
    }
    /**
     * Map the current page to a new page
     *
     * @template S - Type of the new page
     * @param {(value: T, index: number) => S} callbackfn - Function to map the current page
     * @return {*}  {PerformaticPaginationModel<S>}
     * @memberof PerformaticPaginationModel
     */
    map(callbackfn) {
        // eslint-disable-next-line unicorn/no-array-callback-reference
        return new PerformaticPaginationModel(this.page.map((element, index) => callbackfn(element, index)), this.total, this.take, this.skip);
    }
    /**
     * Map the current page to a new page using an asyncronous function
     *
     * @template S- Type of the new page
     * @param {(value: T, index: number) => Promise<S>} callbackfn - Asyncronous function to map the current page
     * @return {*}  {Promise<PerformaticPaginationModel<S>>}
     * @memberof PerformaticPaginationModel
     */
    async asyncMap(callbackfn) {
        const mappedData = await this.page.asyncMap((element, index) => callbackfn(element, index));
        return new PerformaticPaginationModel(mappedData, this.total, this.take, this.skip);
    }
    /**
     * Returns the keys of all objects in the page
     *
     * @readonly
     * @type {string[]}
     * @memberof PerformaticPaginationModel
     */
    get keys() {
        return this.page.getKeys();
    }
    /**
     * Returns the values of all objects in the page
     *
     * @readonly
     * @type {T[keyof T][][]}
     * @memberof PerformaticPaginationModel
     */
    get values() {
        return this.page.getValues();
    }
    /**
     * Returns the number of items in the page
     *
     * @readonly
     * @type {number}
     * @memberof PerformaticPaginationModel
     */
    get count() {
        return this.page.length;
    }
    /**
     * Returns the page as a list of objects
     *
     * @readonly
     * @type {T[]}
     * @memberof PerformaticPaginationModel
     */
    get asList() {
        return this.page.asList;
    }
}


const toPerformaticButton = document.getElementById("to-performatic");
const toJsonButton = document.getElementById("to-json");

const jsonTextArea = document.getElementById("jsonField");
const performaticTextArea = document.getElementById("performaticField");

toPerformaticButton.addEventListener("click", () => {
    const json = JSON.parse(jsonTextArea.value);
    console.log('JSON', json);
    const length = json.length



    const page = PerformaticPaginationModel.build(json, length, length, 0,)

    performaticTextArea.value = JSON.stringify(
        PerformaticPaginationModel.fromData(page)
    );
});

toJsonButton.addEventListener("click", () => {
    const performatic = JSON.parse(performaticTextArea.value);
    console.log('PERFORMATIC', performatic);
    const data2 = PerformaticPaginationModel.fromData(performatic);
    console.log(data2)


    jsonTextArea.value = JSON.stringify(
        PerformaticPaginationModel.fromData(performatic).asList
    );
});
