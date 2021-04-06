/**
 * основной файл-скрипт для загрузки всех в этой папке
 */










/**
 * приводит имя чемпиона в стандартизированный вид для нас
 * @returns 
 */
String.prototype.normalizeChampName = function() {
	return this.replace(/[-`' ]+/g, "").toLowerCase()
}
Object.defineProperty(String.prototype, "normalizeChampName", {enumerable: false})