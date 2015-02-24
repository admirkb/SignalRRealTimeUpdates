using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using WebApplication1.Model;

namespace WebApplication1.Hubs
{
    public class SignalRRealTimeUpdatesSQLServerHub : Hub
    {

        public void GetBugs()
        {
            using (var context = new AdmirAngularSignalREntities())
            {

                var res = context.Bugs;
                Clients.Caller.Bugs(res);
            }

        }
        public void DeleteBug(Bug bug, int key)
        {
            using (var db = new AdmirAngularSignalREntities())
            {

                try
                {
                    Bug b = db.Bugs.Find(bug.Id);
                    db.Bugs.Remove(b);

                    db.SaveChanges();
                    Clients.All.DeleteBug(key);
                }
                catch (Exception ex)
                {

                }


            }


        }
        public bool AddBug(Bug bug, int key)
        {
            try
            {
                using (var db = new AdmirAngularSignalREntities())
                {
                    var b = db.Bugs.Create();
                    b.Problem = bug.Problem;
                    b.Response = bug.Response;
                    b.DateCreated = DateTime.Now;

                    db.Bugs.Add(b);
                    db.SaveChanges();
                    int id = b.Id;

                    Clients.Others.AddBug(b);
                    Clients.Caller.AddMeBug(b, key);
                    return true;
                }
            }
            catch (Exception ex)
            {
                Clients.Caller.reportError("Unable to create bug.");
                return false;
            }



        }
        public bool UpdateBug(Bug bug, int key)
        {
            try
            {
                using (var db = new AdmirAngularSignalREntities())
                {

                    // Find by other means than the id if required.
                    ///var b = db.Bugs.FirstOrDefault(t => t.Id == bug.Id);

                    var b = db.Bugs.Find(bug.Id);
                    b.Problem = (b.Problem != bug.Problem) ? bug.Problem : b.Problem;

                    if (b.Response != bug.Response)
                    {
                        b.Response = bug.Response;
                        b.DateResolved = DateTime.Now;
                    }

                    //b.DateCreated = (b.DateCreated != bug.DateCreated) ? bug.DateCreated : b.DateCreated;


                    db.SaveChanges();

                    Clients.All.UpdateBug(b, key);
                    return true;
                }
            }
            catch (Exception ex)
            {
                Clients.Caller.reportError("Unable to create bug.");
                return false;
            }



        }
        public bool EditNotifyBug(Bug bug, int key)
        {
            try
            {
                using (var db = new AdmirAngularSignalREntities())
                {
                    Clients.Others.EditNotifyBug(bug, key);
                    //Clients.All.EditNotifyBug(bug, key);
                    return true;
                }
            }
            catch (Exception ex)
            {
                Clients.Caller.reportError("Unable to notify bug.");
                return false;
            }



        }
        public bool EditAllowBug(Bug bug, int key)
        {
            try
            {
                using (var db = new AdmirAngularSignalREntities())
                {
                    Clients.Others.EditAllowBug(bug, key);
                    //Clients.All.EditNotifyBug(bug, key);
                    return true;
                }
            }
            catch (Exception ex)
            {
                Clients.Caller.reportError("Unable to notify bug.");
                return false;
            }



        }






    }
}