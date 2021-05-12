/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


 const _local = process._local
 const {config, classes} = _local
 const {Details} = classes
  
  
 module.exports = function(settings, command) {
     const {commands, prefix} = settings
     const comOnline = command.possibly[0]
 
     const details = new Details(command)
     .setDescription({
         ru: `[${comOnline}]`,
         en: `[${comOnline}]`
     })
     .setExample(`${prefix + comOnline}`)
 
     return details
 }